# Simple Python Sample
from __future__ import print_function

import os
import threading
import sublime

IS_ST3 = sublime.version().startswith('3')

def get_vcs_settings():
    """Returns list of dictionaries"""
    if self.config.getboolean("verbose_stamps", fallback=False):
        print("Sending " + command)

    # Add a newline because the ui reads per line
    command += " \n"
    if self.gtk_proc:
        # Send the command as bytes
        self.gtk_proc.stdin.write(bytearray(command.encode("utf-8")))
        self.gtk_proc.stdin.flush()
        try:
			constructor = getattr(module, type)
		except AttributeError:
			print(_("Error: Class {} not found").format(type))
			continue

    else
		instance = constructor()
		instance.verbose = verbose
		instance.config = config

def do_when(conditional, callback, *args, **kwargs):
    if conditional():
        return callback(*args, **kwargs)
    sublime.set_timeout(functools.partial(do_when, conditional, callback, *args, **kwargs), 50)
