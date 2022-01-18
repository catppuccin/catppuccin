LOG_INFO=$(shell date +"%H:%M:%S") \e[0;34mINFO\e[0m
LOG_ERROR=$(shell date +"%H:%M:%S") \e[1;31mERROR\e[0m
LOG_WARNING=$(shell date +"%H:%M:%S") \e[0;33mWARNING\e[0m
LOG_SUCCESS=$(shell date +"%H:%M:%S") \e[0;32mSUCCESS\e[0m


ROOT_DIR=$(shell git rev-parse --show-toplevel)
dest=/tmp/ctp_test
export ROOT_DIR

link:
	@echo -e "$(LOG_INFO) Linking Catppuccin's resources..."
	@for file in * ; do [[ $$file != "Makefile" ]] && [[ $$file != "README.md" ]] && { parsed="$${file/'.sh'/''}" ; echo -e "$(LOG_WARNING) Creating symlink for $${parsed}" ; ln -s $(ROOT_DIR)/resources/$$file $(dest)/$$parsed ; } done
	@echo -e "$(LOG_SUCCESS) Finished linking resources 🥳"
