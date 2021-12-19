import sys
import os
import re

from i18n import _

from importlib.machinery import SourceFileLoader


class RubberStamp:
	"""Howdy rubber stamp"""

	UI_TEXT = "ui_text"
	UI_SUBTEXT = "ui_subtext"

	def set_ui_text(self, text, type=None):
		"""Convert an ui string to input howdy-gtk understands"""
		typedec = "M"

		if type == self.UI_SUBTEXT:
			typedec = "S"

		return self.send_ui_raw(typedec + "=" + text)

	def send_ui_raw(self, command):
		"""Write raw command to howdy-gtk stdin"""
		if self.config.getboolean("debug", "verbose_stamps", fallback=False):
			print("Sending command to howdy-gtk: " + command)

		# Add a newline because the ui reads per line
		command += " \n"
		if self.gtk_proc:
			# Send the command as bytes
			self.gtk_proc.stdin.write(bytearray(command.encode("utf-8")))
			self.gtk_proc.stdin.flush()

def execute(config, gtk_proc, opencv):
	verbose = config.getboolean("debug", "verbose_stamps", fallback=False)
	dir_path = os.path.dirname(os.path.realpath(__file__))
	installed_stamps = []

	# Go through each file in the rubberstamp folder
	for filename in os.listdir(dir_path):
		# Remove non-readable file or directories
		if not os.path.isfile(dir_path + "/" + filename):
			continue

		# Remove meta files
		if filename in ["__init__.py", ".gitignore"]:
			continue

		# Add the found file to the list of enabled rubberstamps
		installed_stamps.append(filename.split(".")[0])

	if verbose: print("Installed rubberstamps: " + ", ".join(installed_stamps))

	# Get the rules defined in the config
	raw_rules = config.get("rubberstamps", "stamp_rules")
	rules = raw_rules.split("\n")

	# Go through the rules one by one
	for rule in rules:
		rule = rule.strip()

		if len(rule) <= 1:
			continue

		# Parse the rule with regex
		regex_result = re.search("^(\w+)\s+([\w\.]+)\s+([a-z]+)(.*)?$", rule, re.IGNORECASE)

		# Error out if the regex did not match (invalid line)
		if not regex_result:
			print(_("Error parsing rubberstamp rule: {}").format(rule))
			continue

		type = regex_result.group(1)

		# Error out if the stamp name in the rule is not a file
		if type not in installed_stamps:
			print(_("Stamp not installed: {}").format(type))
			continue

		# Load the module from file
		module = SourceFileLoader(type, dir_path + "/" + type + ".py").load_module()

		# Try to get the class with the same name
		try:
			constructor = getattr(module, type)
		except AttributeError:
			print(_("Stamp error: Class {} not found").format(type))
			continue

		# Init the class and set common values
		instance = constructor()
		instance.verbose = verbose
		instance.config = config
		instance.gtk_proc = gtk_proc
		instance.opencv = opencv

		# Set some opensv shorthands
		instance.video_capture = opencv["video_capture"]
		instance.face_detector = opencv["face_detector"]
		instance.pose_predictor = opencv["pose_predictor"]
		instance.clahe = opencv["clahe"]

		# Parse and set the 2 required options for all rubberstamps
		instance.options = {
			"timeout": float(re.sub("[a-zA-Z]", "", regex_result.group(2))),
			"failsafe": regex_result.group(3) != "faildeadly"
		}

		# Try to get the class do declare its other config variables
		try:
			instance.declare_config()
		except Exception:
			print(_("Internal error in rubberstamp configuration declaration:"))

			import traceback
			traceback.print_exc()
			continue

		# Split the optional arguments at the end of the rule by spaces
		raw_options = regex_result.group(4).split()

		# For each of those aoptional arguments
		for option in raw_options:
			# Get the key to the left, and the value to the right of the equal sign
			key, value = option.split("=")

			# Error out if a key has been set that was not declared by the module before
			if key not in instance.options:
				print("Unknow config option for rubberstamp " + type + ": " + key)
				continue

			# Convert the argument string to an int or float if the declared option has that type
			if isinstance(instance.options[key], int):
				value = int(value)
			elif isinstance(instance.options[key], float):
				value = float(value)

			instance.options[key] = value

		if verbose:
			print("Stamp \"" + type + "\" options parsed:")
			print(instance.options)
			print("Executing stamp")

		# Make the stamp fail by default
		result = False

		# Run the stamp code
		try:
			result = instance.run()
		except Exception:
			print(_("Internal error in rubberstamp:"))

			import traceback
			traceback.print_exc()
			continue

		if verbose: print("Stamp \"" + type + "\" returned: " + str(result))

		# Abort authentication if the stamp returned false
		if result is False:
			if verbose: print("Authentication aborted by rubber stamp")
			sys.exit(14)

	# This is outside the for loop, so we've run all the rules
	if verbose: print("All rubberstamps processed, authentication successful")

	# Exit with no errors
	sys.exit(0)
