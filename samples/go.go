/*
 * Go highlight sample
 */
//go:build (linux || windows) && arm
// +build linux,arm windows,arm

// Package main
package main

import "fmt"
import alias "fmt"

//go:generate go tool yacc -o gopher.go -p parser gopher.y

type (
	PublicInterface interface {
		PublicFunc() int
		privateFunc() int
	}

	privateInterface interface {
		PublicFunc() int
		privateFunc() int
	}

	PublicStruct struct {
		PublicField  int
		privateField int
	}

	privateStruct struct {
		PublicField  int
		privateField int
	}

	demoInt int

	T struct {
		FirstName string `json:"first_name" arbitrary text`
	}
)

const (
	PublicConst  = 1
	privateConst = 2
)

var (
	PublicVar  = 1
	privateVar = 2
)

// PublicFunc does the thing
func PublicFunc() int {
	localVar := PublicVar
	return localVar
}

// privateFunc does the thing
func privateFunc() (int, int) {
	LocalVar := privateVar
	return LocalVar, PublicVar
}

func (ps PublicStruct) PublicFunc() int {
	return ps.privateField
}

func (ps privateStruct) privateFunc() int {
	return ps.PublicField
}

func _(pi PublicInterface) {
}

func _(pi privateInterface) {
}

func variableFunc(demo1 int, demo2 demoInt) {
	demo1 = 3
	a := PublicStruct{}
	a.PublicFunc()
	b := privateStruct{}
	b.privateFunc()
	demo2 = 4
	if demo1, demo2 := privateFunc(); demo1 != 3 {
		_ = demo1
		_ = demo2
		return
	}
demoLabel:
	for demo1 := range []int{1, 2, 3, 4} {
		_ = demo1
		continue demoLabel
	}

	switch {
	case 1 == 2:
		demo1, demo2 := privateFunc()
		_ = demo1
		_ = demo2
	default:
		_ = demo1
	}

	f := func() int {
		return 1
	}
	f()
	PublicFunc()
	variableFunc(1, 2)
	_ = demo1
	_ = demo2
	println("builtin function")
}

func main() {
	const LocalConst = 1
	const localConst = 2
	fmt.Println("demo\n\xA")
	alias.Println("demo")
	variableFunc(1, 2)
	var d, c *int = nil, nil
	_, _ = c, d
	_, _ = true, false
}

var ExportedVariableFunction = func() {}
var packageLocalVariableFunction = func() {}

type typeWithCall struct {
	PublicFieldCall  func()
	privateFieldCall func()
}

func calls(t typeWithCall) {
	var localVariableFunction = func() {}

	ExportedVariableFunction()
	packageLocalVariableFunction()
	localVariableFunction()
	t.PublicFieldCall()
	t.privateFieldCall()
}

func _() {
	var err error
	a, err := 1, nil
	println(a, err)

	for a := 0; a < 10; a++ {
		println(a)
	}
}
