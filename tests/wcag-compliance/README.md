### 📄 Doc

This program tests how compliant Catppuccin's variants are with WCAG standards. The test looks like this: ever color is put on top of the `base` color of the palette with a font size of 15; colors from `subtext0` up are expected to be acceptable. In the case of the dark palettes, they should meet Level AA requirements. As for the light palette, however, they must meet a contrast ratio greater than `2.314159265359`.

#### Dev

```sh
# clone this repo
npm install # fetch all dependencies
```

#### Testing

```sh
npm start

```
