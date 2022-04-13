use crate::context::DrawContext;
use crate::controller::Controller;
use crate::font::FontCache;
use crate::scene::*;
use crate::wayland::*;
use crate::*;
use smithay_client_toolkit::reexports::calloop::{EventLoop, LoopHandle, RegistrationToken};
use smithay_client_toolkit::seat::keyboard::ModifiersState;
use smithay_client_toolkit::shm::AutoMemPool;
use smithay_client_toolkit::WaylandSource;

use std::cell::RefCell;
use std::ops::{Deref, DerefMut};
use std::rc::Rc;

use smithay_client_toolkit::reexports::client::{
    global_filter,
    protocol::wl_buffer::WlBuffer,
    protocol::wl_callback,
    protocol::wl_compositor::WlCompositor,
    protocol::wl_output::{self, WlOutput},
    protocol::wl_pointer::{self, WlPointer},
    protocol::wl_region::WlRegion,
    protocol::wl_seat::{self, Capability, WlSeat},
    protocol::wl_shm::WlShm,
    protocol::wl_surface::WlSurface,
    Attached, Display, GlobalError, GlobalManager, Interface, Main, Proxy,
};
use smithay_client_toolkit::reexports::protocols::wlr::unstable::layer_shell::v1::client::{
    zwlr_layer_shell_v1::ZwlrLayerShellV1, zwlr_layer_surface_v1,
    zwlr_layer_surface_v1::ZwlrLayerSurfaceV1,
};

pub struct Application<M, C>
where
    C: Controller<M> + Clone + 'static,
{
    display: Display,
    globals: Rc<RefCell<Globals>>,
    global_manager: GlobalManager,
    pub inner: Vec<InnerApplication<M, C>>,
    token: RegistrationToken,
}

struct Context {
    pending_cb: bool,
    time: Option<u32>,
    render_node: Option<RenderNode>,
    font_cache: FontCache,
}

pub struct CoreApplication<M, C>
where
    C: Controller<M> + Clone,
{
    pub controller: C,
    ctx: Context,
    globals: Rc<RefCell<Globals>>,
    mempool: AutoMemPool,
    widget: Box<dyn Widget<M>>,
    surface: Option<Surface>,
}

pub struct InnerApplication<M, C>
where
    C: Controller<M> + Clone,
{
    core: CoreApplication<M, C>,
    cb: Box<dyn FnMut(&mut CoreApplication<M, C>, Event<M>)>,
}

impl Surface {
    fn new(
        surface: Main<WlSurface>,
        shell: Shell,
        region: Main<WlRegion>,
        previous: Option<Surface>,
    ) -> Self {
        Surface {
            alive: true,
            surface,
            shell,
            region,
            previous: if let Some(surface) = previous {
                Some(Box::new(surface))
            } else {
                None
            },
            buffer: None,
        }
    }
    fn commit(&mut self) {
        self.surface.commit();
        std::mem::drop(&mut self.previous);
        self.previous = None;
    }
    fn destroy(&mut self) {
        self.alive = false;
        self.surface.destroy();
        self.region.destroy();
        self.shell.destroy();
        if let Some(buffer) = self.buffer.as_ref() {
            buffer.destroy();
        }
        self.buffer = None;
    }
    fn destroy_previous(&mut self) {
        if let Some(surface) = self.previous.as_mut() {
            surface.destroy();
        }
        self.previous = None;
    }
    fn set_size(&self, width: u32, height: u32) {
        self.shell.set_size(width, height);
    }
    fn damage(&self, report: &[Region]) {
        self.surface.attach(self.buffer.as_ref(), 0, 0);
        for d in report {
            self.surface
                .damage(d.x as i32, d.y as i32, d.width as i32, d.height as i32);
        }
    }
    fn attach_buffer(&mut self, buffer: WlBuffer) {
        self.buffer = Some(buffer);
    }
}

impl Globals {
    fn new() -> Self {
        Self {
            outputs: Vec::new(),
            seats: Vec::new(),
            shm: None,
            compositor: None,
            shell: None,
        }
    }
    pub fn create_shell_surface_from<M, C>(
        &self,
        geometry: &dyn Widget<M>,
        config: ShellConfig,
        previous: Option<Surface>,
    ) -> Option<Surface>
    where
        M: 'static,
        C: Controller<M> + Clone + 'static,
    {
        if self.compositor.is_some() {
            match config {
                ShellConfig::LayerShell(config) => {
                    if let Some(layer_shell) = self.shell.as_ref() {
                        let region = self.compositor.as_ref().unwrap().create_region();
                        let wl_surface = self.compositor.as_ref().unwrap().create_surface();
                        let layer_surface = layer_shell.get_layer_surface(
                            &wl_surface,
                            config.output.as_ref(),
                            config.layer,
                            config.namespace.clone(),
                        );
                        if let Some(anchor) = &config.anchor {
                            layer_surface.set_anchor(*anchor);
                        }
                        wl_surface.quick_assign(|_, _, _| {});
                        layer_surface.set_exclusive_zone(config.exclusive);
                        layer_surface.set_keyboard_interactivity(config.interactivity);
                        layer_surface.set_size(geometry.width() as u32, geometry.height() as u32);
                        layer_surface.set_margin(
                            config.margin[0],
                            config.margin[1],
                            config.margin[2],
                            config.margin[3],
                        );
                        wl_surface.commit();
                        assign_surface::<M, C>(&layer_surface);
                        return Some(Surface::new(
                            wl_surface,
                            Shell::LayerShell {
                                surface: layer_surface,
                                config,
                            },
                            region,
                            previous,
                        ));
                    }
                }
            }
        }
        None
    }
    pub fn create_mempool(&self) -> AutoMemPool {
        let attached = Attached::from(self.shm.clone().unwrap());
        AutoMemPool::new(attached).unwrap()
    }
    pub fn get_outputs(&self) -> Vec<Output> {
        self.outputs.clone()
    }
    pub fn get_seats(&self) -> &[Seat] {
        &self.seats
    }
}

impl Output {
    fn new(output: Main<WlOutput>) -> Self {
        Output {
            width: 0,
            height: 0,
            scale: 1,
            name: String::new(),
            output,
        }
    }
}

impl<M, C> Application<M, C>
where
    M: 'static,
    C: Controller<M> + Clone + 'static,
{
    pub fn new(pointer: bool) -> (Self, EventLoop<'static, Self>) {
        let display = Display::connect_to_env().unwrap();
        let event_queue = display.create_event_queue();
        let attached_display = (*display).clone().attach(event_queue.token());

        let display_handle = display.clone();

        let globals = Globals::new();

        let global_manager = GlobalManager::new_with_cb(
            &attached_display,
            global_filter!(
                [
                    ZwlrLayerShellV1,
                    1,
                    |layer_shell: Main<ZwlrLayerShellV1>, mut application: DispatchData| {
                        if let Some(application) = application.get::<Application<M, C>>() {
                            if let Ok(mut globals) = application.globals.try_borrow_mut() {
                                globals.shell = Some(layer_shell);
                            }
                        }
                    }
                ],
                [
                    WlShm,
                    1,
                    |shm: Main<WlShm>, mut application: DispatchData| {
                        shm.quick_assign(|_, _, _| {});
                        if let Some(application) = application.get::<Application<M, C>>() {
                            if let Ok(mut globals) = application.globals.try_borrow_mut() {
                                globals.shm = Some(shm);
                            }
                        }
                    }
                ],
                [
                    WlCompositor,
                    4,
                    |compositor: Main<WlCompositor>, mut application: DispatchData| {
                        if let Some(application) = application.get::<Application<M, C>>() {
                            if let Ok(mut globals) = application.globals.try_borrow_mut() {
                                globals.compositor = Some(compositor);
                            }
                        }
                    }
                ],
                [WlSeat, 7, move |seat: Main<WlSeat>, _: DispatchData| {
                    seat.quick_assign(move |wl_seat, event, mut application| match event {
                        wl_seat::Event::Capabilities { capabilities } => {
                            if let Some(application) = application.get::<Application<M, C>>() {
                                if pointer
                                    && capabilities & Capability::Pointer == Capability::Pointer
                                {
                                    let pointer = wl_seat.get_pointer();
                                    assign_pointer::<M, C>(&pointer);
                                }
                                if let Ok(mut globals) = application.globals.try_borrow_mut() {
                                    let mut found = None;
                                    for seat in &mut globals.seats {
                                        if wl_seat.eq(&seat.seat) {
                                            found = Some(());
                                            seat.capabilities = capabilities;
                                        }
                                    }
                                    if found.is_none() {
                                        globals.seats.push(Seat {
                                            capabilities,
                                            seat: wl_seat,
                                        });
                                    }
                                }
                            }
                        }
                        _ => {}
                    });
                }],
                [
                    WlOutput,
                    3,
                    |output: Main<WlOutput>, _application: DispatchData| {
                        output.quick_assign(move |wl_output, event, mut application| match event {
                            wl_output::Event::Geometry {
                                x: _,
                                y: _,
                                physical_width: _,
                                physical_height: _,
                                subpixel: _,
                                make,
                                model: _,
                                transform: _,
                            } => {
                                if let Some(application) = application.get::<Application<M, C>>() {
                                    if let Ok(mut globals) = application.globals.try_borrow_mut() {
                                        let mut found = None;
                                        for output in &mut globals.outputs {
                                            if wl_output.eq(&output.output) {
                                                found = Some(());
                                                output.name = make.clone();
                                            }
                                        }
                                        if found.is_none() {
                                            let mut output = Output::new(wl_output);
                                            output.name = make;
                                            globals.outputs.push(output);
                                        }
                                    }
                                }
                            }
                            wl_output::Event::Mode {
                                flags: _,
                                width,
                                height,
                                refresh: _,
                            } => {
                                if let Some(application) = application.get::<Application<M, C>>() {
                                    if let Ok(mut globals) = application.globals.try_borrow_mut() {
                                        let mut found = None;
                                        for output in &mut globals.outputs {
                                            if wl_output.eq(&output.output) {
                                                found = Some(());
                                                output.width = width;
                                                output.height = height;
                                            }
                                        }
                                        if found.is_none() {
                                            let mut output = Output::new(wl_output);
                                            output.width = width;
                                            output.height = height;
                                            globals.outputs.push(output);
                                        }
                                    }
                                }
                            }
                            wl_output::Event::Scale { factor } => {
                                if let Some(application) = application.get::<Application<M, C>>() {
                                    if let Ok(mut globals) = application.globals.try_borrow_mut() {
                                        let mut found = None;
                                        for output in &mut globals.outputs {
                                            if wl_output.eq(&output.output) {
                                                found = Some(());
                                                output.scale = factor;
                                            }
                                        }
                                        if found.is_none() {
                                            let mut output = Output::new(wl_output);
                                            output.scale = factor;
                                            globals.outputs.push(output);
                                        }
                                    }
                                }
                            }
                            wl_output::Event::Done => {}
                            _ => {}
                        });
                    }
                ]
            ),
        );

        let event_loop = EventLoop::try_new().expect("Failed to initialize the event loop!");
        let token = WaylandSource::new(event_queue)
            .quick_insert(event_loop.handle())
            .unwrap();

        let (mut application, mut event_loop) = (
            Application {
                display,
                globals: Rc::new(RefCell::new(globals)),
                global_manager,
                inner: Vec::new(),
                token,
            },
            event_loop,
        );

        for _ in 0..2 {
            display_handle.flush().unwrap();
            event_loop.dispatch(None, &mut application).unwrap();
        }

        (application, event_loop)
    }
    fn get_index(&self, surface: &WlSurface) -> usize {
        for i in 0..self.inner.len() {
            if self.inner[i].eq(surface) {
                return i;
            }
        }
        0
    }
    fn get_application(&mut self, surface: &WlSurface) -> Option<&mut InnerApplication<M, C>> {
        for inner in &mut self.inner {
            if inner.eq(surface) {
                return Some(inner);
            }
        }
        None
    }
    pub fn get_global<I>(&self) -> Result<Main<I>, GlobalError>
    where
        I: Interface + AsRef<Proxy<I>> + From<Proxy<I>>,
    {
        self.global_manager.instantiate_range::<I>(0, 1 << 8)
    }
    pub fn create_empty_inner_application<Data: 'static>(
        &mut self,
        controller: C,
        widget: impl Widget<M> + 'static,
        handle: LoopHandle<'_, Data>,
        cb: impl FnMut(&mut CoreApplication<M, C>, Event<M>) + 'static,
    ) {
        let inner_application =
            InnerApplication::empty(controller, widget, self.globals.clone(), cb);
        self.inner.push(inner_application);
        handle.update(&self.token).unwrap();
    }
    pub fn create_inner_application_from<Data: 'static>(
        &mut self,
        controller: C,
        config: ShellConfig,
        widget: impl Widget<M> + 'static,
        handle: LoopHandle<'_, Data>,
        cb: impl FnMut(&mut CoreApplication<M, C>, Event<M>) + 'static,
    ) {
        let inner_application =
            InnerApplication::new(controller, widget, config, self.globals.clone(), cb);
        self.inner.push(inner_application);
        handle.update(&self.token).unwrap();
    }
    pub fn create_inner_application<Data: 'static>(
        &mut self,
        controller: C,
        widget: impl Widget<M> + 'static,
        handle: LoopHandle<'_, Data>,
        cb: impl FnMut(&mut CoreApplication<M, C>, Event<M>) + 'static,
    ) {
        let inner_application =
            InnerApplication::normal(controller, widget, self.globals.clone(), cb);
        self.inner.push(inner_application);
        handle.update(&self.token).unwrap();
    }
    pub fn run(mut self, event_loop: &mut EventLoop<'static, Self>) {
        loop {
            self.display.flush().unwrap();
            event_loop.dispatch(None, &mut self).unwrap();
        }
    }
}

impl<M, C> Deref for InnerApplication<M, C>
where
    C: Controller<M> + Clone + 'static,
{
    type Target = CoreApplication<M, C>;
    fn deref(&self) -> &Self::Target {
        &self.core
    }
}

impl<M, C> DerefMut for InnerApplication<M, C>
where
    C: Controller<M> + Clone + 'static,
{
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.core
    }
}

impl<M, C> CoreApplication<M, C>
where
    M: 'static,
    C: Controller<M> + Clone + 'static,
{
    pub fn poll(&mut self, ev: Event<M>) -> C {
        let mut ctl = self.controller.clone();
        let mut sync_ctx = SyncContext::new(&mut ctl, &mut self.ctx.font_cache);
        self.widget.sync(&mut sync_ctx, ev);
        ctl
    }
    pub fn sync(&mut self, ev: Event<M>) -> bool {
        let mut sync_ctx = SyncContext::new(&mut self.controller, &mut self.ctx.font_cache);
        let mut damage = self.widget.sync(&mut sync_ctx, ev);
        while let Ok(msg) = sync_ctx.sync() {
            damage = damage.max(self.widget.sync(&mut sync_ctx, Event::Message(&msg)));
        }
        if damage == Damage::Frame {
            if self.ctx.time.is_none() {
                self.ctx.time = Some(0);
            }
        }
        damage.is_some() && !self.ctx.pending_cb
    }
    pub fn destroy(&mut self) {
        if let Some(surface) = self.surface.as_mut() {
            surface.destroy();
        }
    }
    pub fn get_layer_surface(&self) -> ZwlrLayerSurfaceV1 {
        match &self.surface.as_ref().unwrap().shell {
            Shell::LayerShell { config: _, surface } => surface.detach(),
        }
    }
    pub fn is_hidden(&self) -> bool {
        if let Some(surface) = self.surface.as_ref() {
            return !surface.alive;
        } else {
            true
        }
    }
    pub fn replace_surface(&mut self) {
        if let Some(surface) = self.surface.as_mut() {
            surface.destroy();
            surface.alive = true;
            match &surface.shell {
                Shell::LayerShell { config, surface: _ } => {
                    self.surface = self.globals.borrow().create_shell_surface_from::<M, C>(
                        self.widget.deref(),
                        ShellConfig::LayerShell(config.clone()),
                        Some(surface.clone()),
                    );
                }
            }
        } else {
            self.surface = self.globals.borrow().create_shell_surface_from::<M, C>(
                self.widget.deref(),
                ShellConfig::LayerShell(LayerShellConfig::default()),
                None,
            );
        }
    }
    pub fn replace_surface_by(&mut self, config: ShellConfig) {
        if let Some(surface) = self.surface.as_mut() {
            surface.destroy();
            surface.alive = true;
            self.surface = self.globals.borrow().create_shell_surface_from::<M, C>(
                self.widget.deref(),
                config,
                Some(surface.clone()),
            );
        } else {
            self.surface = self.globals.borrow().create_shell_surface_from::<M, C>(
                self.widget.deref(),
                config,
                None,
            );
        }
    }
}

impl<M, C> Geometry for InnerApplication<M, C>
where
    C: Controller<M> + Clone + 'static,
{
    fn width(&self) -> f32 {
        self.widget.width()
    }
    fn height(&self) -> f32 {
        self.widget.height()
    }
    fn set_size(&mut self, width: f32, height: f32) -> Result<(), (f32, f32)> {
        if let Some(surface) = self.surface.as_ref() {
            surface.set_size(width as u32, height as u32);
            surface.surface.commit();
        }
        Ok(())
    }
}

impl<M, C> InnerApplication<M, C>
where
    M: 'static,
    C: Controller<M> + Clone + 'static,
{
    pub fn empty(
        controller: C,
        widget: impl Widget<M> + 'static,
        globals: Rc<RefCell<Globals>>,
        cb: impl FnMut(&mut CoreApplication<M, C>, Event<M>) + 'static,
    ) -> Self {
        let mempool = globals.borrow().create_mempool();
        let mut default = InnerApplication {
            core: CoreApplication {
                controller,
                ctx: Context {
                    pending_cb: false,
                    time: None,
                    font_cache: FontCache::new(),
                    render_node: None,
                },
                surface: None,
                widget: Box::new(widget),
                mempool,
                globals,
            },
            cb: Box::new(cb),
        };
        default.sync(Event::Prepare);
        default
    }
    pub fn normal(
        controller: C,
        widget: impl Widget<M> + 'static,
        globals: Rc<RefCell<Globals>>,
        cb: impl FnMut(&mut CoreApplication<M, C>, Event<M>) + 'static,
    ) -> Self {
        let mempool = globals.borrow().create_mempool();
        let mut default = InnerApplication {
            core: CoreApplication {
                controller,
                ctx: Context {
                    pending_cb: false,
                    time: None,
                    font_cache: FontCache::new(),
                    render_node: None,
                },
                surface: None,
                widget: Box::new(widget),
                mempool,
                globals,
            },
            cb: Box::new(cb),
        };
        default.sync(Event::Prepare);
        default.replace_surface();
        default
    }
    pub fn new(
        controller: C,
        widget: impl Widget<M> + 'static,
        config: ShellConfig,
        globals: Rc<RefCell<Globals>>,
        cb: impl FnMut(&mut CoreApplication<M, C>, Event<M>) + 'static,
    ) -> Self {
        let mempool = globals.borrow().create_mempool();
        let mut new = InnerApplication {
            core: CoreApplication {
                controller,
                ctx: Context {
                    pending_cb: false,
                    time: None,
                    font_cache: FontCache::new(),
                    render_node: None,
                },
                surface: None,
                widget: Box::new(widget),
                mempool,
                globals,
            },
            cb: Box::new(cb),
        };
        new.sync(Event::Prepare);
        new.replace_surface_by(config);
        new
    }
    fn eq(&self, wl_surface: &WlSurface) -> bool {
        if let Some(surface) = &self.surface {
            return surface.surface.detach().eq(wl_surface);
        }
        false
    }
    pub fn roundtrip(&mut self, ev: Event<M>) -> Result<RenderNode, ()> {
        let width = self.width();
        let height = self.height();

        // Sending the event to the widget tree
        if self.sync(ev) || ev.is_frame() {
            // Calling the application´s closure
            (self.cb)(&mut self.core, ev);

            if !self.is_hidden() {
                let current_width = self.width();
                let current_height = self.height();

                // Resizing the surface in case the widget changed size
                if ev.is_frame() {
                    self.ctx.render_node = None;
                } else if width != current_width || height != current_height {
                    let _ = self.set_size(current_width, current_height);
                    return Err(());
                }

                // Creating the render node
                let render_node = self.core.widget.create_node(0., 0.);

                self.ctx.pending_cb = true;

                return Ok(render_node);
            }
        } else {
            // Calling the application´s closure
            (self.cb)(&mut self.core, ev);
        }

        Err(())
    }
    fn render(&mut self, time: u32, recent_node: RenderNode) {
        let width = recent_node.width();
        let height = recent_node.height();
        if Some(time).ne(&self.core.ctx.time) || time == 0 {
            if let Ok((buffer, wl_buffer)) =
                Buffer::new(&mut self.core.mempool, width as i32, height as i32)
            {
                let mut v = Vec::new();
                let mut ctx =
                    DrawContext::new(buffer.backend, &mut self.core.ctx.font_cache, &mut v);
                if let Some(render_node) = self.core.ctx.render_node.as_mut() {
                    if let Err(region) = render_node.draw_merge(
                        recent_node,
                        &mut ctx,
                        &Instruction::empty(0., 0., width, height),
                        None,
                    ) {
                        ctx.damage_region(&Background::Transparent, region, false);
                    }
                } else {
                    ctx.damage_region(
                        &Background::Transparent,
                        Region::new(0., 0., width, height),
                        false,
                    );
                    recent_node.render(&mut ctx, None);
                    self.core.ctx.render_node = Some(recent_node);
                }
                self.core.ctx.pending_cb = false;
                if let Some(surface) = self.core.surface.as_mut() {
                    surface.attach_buffer(wl_buffer);
                    surface.damage(&v);
                    surface.commit();
                    if let Some(_) = self.core.ctx.time {
                        self.core.ctx.time = Some(time);
                        frame_callback::<M, C>(time, surface.surface.clone());
                    }
                }
            }
        }
    }
    pub fn callback(&mut self, ev: Event<M>) {
        if self.ctx.time.is_none() || ev.is_cb() {
            if let Ok(render_node) = self.roundtrip(ev) {
                if let Some(surface) = self.surface.as_ref() {
                    draw_callback::<M, C>(&surface.surface, render_node);
                }
            }
        } else {
            let width = self.width();
            let height = self.height();

            self.sync(ev);

            let current_width = self.width();
            let current_height = self.height();

            // Resizing the surface in case the widget changed size
            if width != current_width || height != current_height {
                let _ = self.set_size(current_width, current_height);
            }
        }
    }
}

fn frame_callback<M, C>(time: u32, surface: Main<WlSurface>)
where
    M: 'static,
    C: Controller<M> + Clone + 'static,
{
    let h = surface.detach();
    surface
        .frame()
        .quick_assign(move |_, event, mut application| match event {
            wl_callback::Event::Done { callback_data } => {
                let timeout = (callback_data - time).min(50);
                if let Some(application) = application.get::<Application<M, C>>() {
                    if let Some(inner_application) = application.get_application(&h) {
                        inner_application.ctx.time = None;
                        inner_application.callback(Event::Callback(timeout));
                    }
                }
            }
            _ => {}
        });
    surface.commit();
}

fn draw_callback<M, C>(surface: &Main<WlSurface>, mut recent_node: RenderNode)
where
    M: 'static,
    C: Controller<M> + Clone + 'static,
{
    let h = surface.detach();
    surface
        .frame()
        .quick_assign(move |_, event, mut application| match event {
            wl_callback::Event::Done { callback_data } => {
                if let Some(application) = application.get::<Application<M, C>>() {
                    let inner_application = application.get_application(&h).unwrap();
                    inner_application.render(callback_data, std::mem::take(&mut recent_node));
                }
            }
            _ => {}
        });
    surface.commit();
}

impl From<ModifiersState> for Modifiers {
    fn from(modifer_state: ModifiersState) -> Modifiers {
        Modifiers {
            ctrl: modifer_state.ctrl,
            alt: modifer_state.alt,
            shift: modifer_state.shift,
            caps_lock: modifer_state.caps_lock,
            logo: modifer_state.logo,
            num_lock: modifer_state.num_lock,
        }
    }
}

fn assign_pointer<M, C>(pointer: &Main<WlPointer>)
where
    M: 'static,
    C: Controller<M> + Clone + 'static,
{
    let mut index = 0;
    let mut input = Pointer::Enter;
    let (mut x, mut y) = (0., 0.);
    pointer.quick_assign(move |_, event, mut inner| match event {
        wl_pointer::Event::Leave { serial: _, surface } => {
            input = Pointer::Leave;
            if let Some(application) = inner.get::<Application<M, C>>() {
                if let Some(inner_application) = application.get_application(&surface) {
                    inner_application.callback(Event::Pointer(x as f32, y as f32, input));
                }
            }
        }
        wl_pointer::Event::Button {
            serial: _,
            time,
            button,
            state,
        } => {
            input = Pointer::MouseClick {
                time,
                button: MouseButton::new(button),
                pressed: state == wl_pointer::ButtonState::Pressed,
            };
        }
        wl_pointer::Event::Frame => {
            if let Some(application) = inner.get::<Application<M, C>>() {
                let inner_application = application.inner.get_mut(index).unwrap();
                inner_application.callback(Event::Pointer(x as f32, y as f32, input));
            }
        }
        wl_pointer::Event::Axis {
            time: _,
            axis,
            value,
        } => {
            input = Pointer::Scroll {
                orientation: match axis {
                    wl_pointer::Axis::VerticalScroll => Orientation::Vertical,
                    wl_pointer::Axis::HorizontalScroll => Orientation::Horizontal,
                    _ => Orientation::Vertical,
                },
                value: value as f32,
            }
        }
        wl_pointer::Event::Enter {
            serial: _,
            surface,
            surface_x,
            surface_y,
        } => {
            if let Some(application) = inner.get::<Application<M, C>>() {
                x = surface_x;
                y = surface_y;
                index = application.get_index(&surface);
            }
        }
        wl_pointer::Event::Motion {
            time: _,
            surface_x,
            surface_y,
        } => {
            x = surface_x;
            y = surface_y;
            input = Pointer::Hover;
        }
        _ => {}
    });
}

fn assign_surface<M, C>(shell: &Main<ZwlrLayerSurfaceV1>)
where
    M: 'static,
    C: Controller<M> + Clone + 'static,
{
    shell.quick_assign(move |shell, event, mut inner| match event {
        zwlr_layer_surface_v1::Event::Configure {
            serial,
            width,
            height,
        } => {
            shell.ack_configure(serial);
            println!("\nCONFIGURE - {} : {} X {}\n", serial, width, height);
            if let Some(application) = inner.get::<Application<M, C>>() {
                for inner_application in &mut application.inner {
                    if let Some(app_surface) = inner_application.surface.as_mut() {
                        match &app_surface.shell {
                            Shell::LayerShell { config: _, surface } => {
                                if shell.eq(surface) {
                                    app_surface.destroy_previous();
                                    let _ = inner_application
                                        .widget
                                        .set_size(width as f32, height as f32);
                                    if inner_application.ctx.pending_cb {
                                        if let Ok(render_node) =
                                            inner_application.roundtrip(Event::Frame)
                                        {
                                            draw_callback::<M, C>(
                                                &inner_application
                                                    .surface
                                                    .as_ref()
                                                    .unwrap()
                                                    .surface,
                                                render_node,
                                            );
                                        }
                                    } else {
                                        if let Ok(render_node) =
                                            inner_application.roundtrip(Event::Frame)
                                        {
                                            inner_application.render(0, render_node);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        _ => unreachable!(),
    });
}
