// import { platform } from 'os';

const os = require('os')
const execa = require("execa")
const ColorContrastChecker = require('color-contrast-checker')

const {stdout} = execa('echo', ['unicorns']);
console.log(stdout);


function get_git_root() {
	try {
		let cmd = ''

		if (platform() === 'win32') {
			cmd = `git rev-parse --show-toplevel `
		} else {
			cmd = `(git rev-parse --show-toplevel )`
		}

		const { stdout } = execa.shellSync(cmd)

		return stdout
	} catch (e) {
		return ''
	}
}

// console.log(execa.shellSync("echo 'hello'"))

// /* File System Object */
// var fs = require('fs');
//
// pr

/* Read File */
// fs.readFile(get_git_root() + "palettes.json", bar)

function bar (err, data)
  {
  /* If an error exists, show it, otherwise show the file */
  err ? Function("error","throw error")(err) : console.log(JSON.stringify(data) );
  };

// const fs = require("fs")
//

// var ccc = new ColorContrastChecker();
// var palettes = fs.readFileSync('../../palettes.json', 'utf8');
// var palettes = fs.readFile('test.json', 'utf8');

// fs.readFile("../../../palettes.json", function(text){
//     palettes = text.split("\n")
// });

// for (var key in palettes) {
// 	console.log(key)
// if (ccc.isLevelAA(background, rainbow[key], 14)) {
// 	console.log("  •" + key + ": ✅");
// } else {
// 	console.log("  •" + key + ": ❌");
// }
// }

// const background = "#1E1D2F"
// var rainbow = {
// 	rosewater: "#F5E0DC",
// 	flamingo: "#F2CDCD",
// 	mauve: "#DDB6F2",
// 	pink: "#F5C2E7",
// 	red: "#F28FAD",
// 	maroon: "#E8A2AF",
// 	peach: "#F8BD96",
// 	yellow: "#FAE3B0",
// 	green: "#ABE9B3",
// 	blue: "#96CDFB",
// 	sky: "#89DCEB",
// 	teal: "#B5E8E0",
// 	lavender: "#C9CBFF",
// 	white: "#D9E0EE",
// 	gray2: "#C3BAC6",
// 	gray1: "#988BA2",
// 	gray0: "#6E6C7E",
// 	black4: "#575268",
// 	black3: "#302D41",
// 	black2: "#1E1D2F",
// 	black1: "#1A1823",
// 	black0: "#131020",
// }
//
// console.log("\t---- WCAG conformance level AA on Catppuccin ----\n")
//
// for (var key in rainbow) {
// 	if (ccc.isLevelAA(background, rainbow[key], 14)) {
// 		console.log("  •" + key + ": ✅");
// 	} else {
// 		console.log("  •" + key + ": ❌");
// 	}
// }

// var color1 = "#FFFFFF";
// var color2 = "#000000";
//
// if (ccc.isLevelAA(color1, color2, 14)) {
//     console.log("Valid Level AA");
// } else {
//     console.log("Invalid Contrast");
// }
//
// console.log("Hello world!")
