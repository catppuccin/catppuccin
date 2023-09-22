#[macro_use]
extern crate log;

use std::collections::HashMap;
use std::rc::Rc;

mod stuff;

pub enum Flag {
    Good,
    Bad,
    Ugly,
}

const QUALITY: Flag = Flag::Good;

static COUNTER: AtomicUsize = AtomicUsize::new(0);

extern "C" {
    static mut ERROR_MESSAGE: *mut std::os::raw::c_char;
}

struct Table<const N: usize>([[i32; N]; N]);

pub trait Write {
    fn write(&mut self, buf: &[u8]) -> Result<usize>;
}

struct Object<T> {
    flag: Flag,
    fields: HashMap<T, u64>,
}

union MyUnion {
    f1: u32,
    f2: f32,
}

type RcObject<T> = Rc<Object<T>>;

impl<T> Write for Object<T> {
    fn write(&mut self, buf: &[u8]) -> Result<usize> {
        let s = stuff::write_map(&self.fields, buf)?;
        info!("{} byte(s) written", s);
        Ok(s)
    }
}

impl<T> Default for Object<T> {
    fn default() -> Self {
        Object {
            flag: Flag::Good,
            fields: HashMap::new(),
        }
    }
}

macro_rules! make_wrapper {
    ($wrapper_ty:ident, $base_ty:ty $(, $lu_ty:ty)?) => {
        pub struct $wrapper_ty($base_ty);
        impl From<$base_ty> for $wrapper_ty {
            fn from(base: $base_ty) -> Self {
                Self(base)
            }
        }
        $(
            impl From<$lu_ty> for $wrapper_ty {
                fn from(lu: $lu_ty) -> Self {
                    Self(lu.get())
                }
            }
            impl From<$wrapper_ty> for $lu_ty {
                fn from(st: $wrapper_ty) -> Self {
                    Self::new(st.0)
                }
            }
        )?
    }
}

/* Block comment */
fn main() {
    // A simple integer calculator:
    // `+` or `-` means add or subtract by 1
    // `*` or `/` means multiply or divide by 2
    stuff::AppVersion::print();

    let input = Option::None;
    let program = input.unwrap_or_else(|| "+ + * - /");
    let mut accumulator = 0;

    for token in program.chars() {
        match token {
            '+' => accumulator += 1,
            '-' => accumulator -= 1,
            '*' => accumulator *= 2,
            '/' => accumulator /= 2,
            _ => { /* ignore everything else */ }
        }
    }

    info!(
        "The program \"{}\" calculates the value {}",
        program, accumulator
    );
}

// example syntax for derive
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct MyStruct {
    pub field1: u32,
    pub field2: u32,
}

/// Some documentation `with a code`, *an italic text*
/// and **a bold text**
/// # Heading
/// [Rust](https://www.rust-lang.org/)
#[cfg(target_os = "linux")]
unsafe fn a_function<T: 'lifetime>(count: &mut i64) -> ! {
    count += 1;
    'label: loop {
        let str_with_escapes = "Hello\x20W\u{f3}rld!\u{abcd}";
        println!("{} {foo:<4}", str_with_escapes, foo = 42);
    }
}

fn test() {
    unsafe {
        a_function(1);
    }
}

#[cfg(feature = "disabled_feature")]
fn cfg_disabled_function() {}
