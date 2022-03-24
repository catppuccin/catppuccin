const Generator = require("yeoman-generator")
const chalk = require('chalk')
const yosay = require("yosay")

module.exports = class extends Generator {
	prompting() {
		// have yeoman greet the user
		this.log(chalk.red("Let\'s do this"))

		const prompts = [{
			message: 'Enter the excercise title',
			worker: true,
			action: null,
			age: 123
		}];

		return this.prompt(prompts).then(props => {
			// you can access them later
			this.props = props
		})
	}
}

function exclamate(message) {
	return message + "!"
}

console.log(exclamate("lol"))
