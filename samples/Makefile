# Simple Makefile
include make.mk

all: hello ## Doc comment

hello: hello.o world.o
.PHONY: hello

GCC = gcc \
           -O2

.o.c:
ifeq ($(FOO),'bar')
	$(GCC) -c qwe \
              -Wall
else
	echo "Hello World"
	$(error Architecture $(ARCH) is not supported)
endif