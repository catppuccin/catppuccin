import {variants, labels} from '@catppuccin/palette'
import ColorContrastChecker from "color-contrast-checker"
import chalk from "chalk"
var ccc = new ColorContrastChecker();

const FONT_SIZE = 15
const LATTE_CONTRAST_RATIO = 2.314159265359


function write(msg) {
    process.stdout.write(msg)
}

function get_tabs(str) {
    if (str.length > 6) {
        return '\t'
    }
    return '\t\t'
}

function get_rgb(c) {
    return parseInt(c, 16) || c
}

function gets_rgb(c) {
    return get_rgb(c) / 255 <= 0.03928
        ? get_rgb(c) / 255 / 12.92
        : Math.pow((get_rgb(c) / 255 + 0.055) / 1.055, 2.4)
}

function get_luminance(hexColor) {
    return (
        0.2126 * gets_rgb(hexColor.substr(1, 2)) +
        0.7152 * gets_rgb(hexColor.substr(3, 2)) +
        0.0722 * gets_rgb(hexColor.substr(-2))
    )
}

function get_contrast(f, b) {
    const L1 = get_luminance(f)
    const L2 = get_luminance(b)
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

function get_text_color(bg_color, preferred_white, preffered_black) {
    let white = preferred_white ? preferred_white : '#ffffff'
    let black = preffered_black ? preffered_black : '#000000'
    const whiteContrast = get_contrast(bg_color, white)
    const blackContrast = get_contrast(bg_color, black)

    return whiteContrast > blackContrast ? white : black
}

function print_color(text, background, preferred_white, preffered_black) {
    write(
        chalk.bgHex(background)(
            chalk.hex(
				get_text_color(background, preferred_white, preffered_black)
            )(text)
        )
    )
}

function good_contrast(base, label_color, custom_ratio) {

	let good_contrast_ratio = ccc.isLevelAA(base, label_color, FONT_SIZE)

	if (custom_ratio) {
		good_contrast_ratio = ccc.isLevelCustom(base, label_color, custom_ratio)
	}

	if (good_contrast_ratio) {
		return "✅"
	} else {
		return "❌"
	}
}

function get_symbol_space(str) {
    if (str.length < 8) {
        return '\t' + ' '.repeat(2)
    } else if (str.length == 8) {
		return '  '
	}
	return ' '
}

write(chalk.hex('#fff')('|Latte|\t\t|Frappe|\t|Macchiato|\t|Moccha|\n\n'))
for (let label in labels) {
    for (let palette in variants) {
		let label_color = variants[palette][label]["hex"]
		let base = variants[palette]["base"]["hex"]
		var symbol_space = get_symbol_space(label)
		let good_contrast_ratio = good_contrast(base, label_color)

		if (palette == "latte") {
			good_contrast_ratio = good_contrast(base, label_color, LATTE_CONTRAST_RATIO)
		}

        print_color(label, base, label_color, label_color)
		write(symbol_space + good_contrast_ratio + "\t")
    }
    console.log('')
}
