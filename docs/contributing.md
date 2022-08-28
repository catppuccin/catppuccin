<p align="center">
  <h2 align="center">🤝 Contributing</h2>
</p>

<p align="center">
	Creating Catppuccin ports
</p>

&nbsp;

### What's a port?

A port is basically an adaptation of Catppuccin's palettes for an app to use. Think of it as a colorscheme for a program that styles every UI component it consists of!

&nbsp;

### Creation

You can create ports using [this](https://github.com/catppuccin/template) public template as a blueprint. However, you must **not** create it the traditional way (by clicking **Use this template**), because this leaves a _small_ tag under the repos' name that says `generated from <template>`. To avoid this, follow the instructions below:

1. Create the repo and leave it empty
2. Add this template as a remote: `git remote add template https://github.com/catppuccin/template.git`
3. Pull from it: `git pull template main --depth=1`
4. Delete the remote: `git remote remove template`

&nbsp;

### Styling!

Although you just created the repo successfully, it's important to style it properly to ensure consistency:

-   The name of the repo must be the simplest version of the app's name (e.g `nvim` instead of `NeoVim`). You may use hyphens if needed (e.g. `windows-files`).
-   Put the images under `assets/`. If there are a bunch of them consider [creating an empty branch](https://gist.github.com/joncardasis/e6494afd538a400722545163eb2e1fa5) (e.g. `assets`) and storing them there.
-   Format the repo's description as "`<allusive emoji>` "Soothing pastel theme for App"
-   Add `catppuccin` to the topics.
-   Ensure uppercase meta files (e.g. `README.md`)
-   Don't add health files (e.g. `CODE_OF_CONDUCTS.md`, `SUPPORT.md`), those are organization-wide files stored [here](https://github.com/catppuccin/.github).

&nbsp;

### Tools

Since Catppuccin is available in 4 palettes it's understandable that it may not be quite as easy to make 4 versions of a port. So to help with that, we have built a bunch of tools to make life easier when creating Catppuccin ports. You'll find them all (with instructions) under our [catppuccin/toolbox](https://github.com/catppuccin/toolbox) repo. Particularly, for the initial problem stated, you'd want to take a look at the [Puccinier](https://github.com/catppuccin/toolbox#%EF%B8%8F-puccinier) tool.

&nbsp;

### Submission

Open an issue under the main repo and fill out the information requested on the "[port request](https://github.com/catppuccin/catppuccin/issues/new?assignees=&labels=port+request&template=port-request.md&title=App)". It's recommended to also share the port in our [Discord server](https://discord.gg/r6Mdz5dpFc) beforehand so that other members of the community can give their opinion on it and hopefully improve it.
