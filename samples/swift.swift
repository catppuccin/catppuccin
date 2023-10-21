#!/usr/bin/swift
/*
 Block comment
 */
import Cocoa // line comment

actor ActorName { var s: [StructName?] }
struct StructName { var s: [StructName?] }
enum EnumName { case Foo, Bar }
protocol ProtocolName {
  associatedtype AssociatedType
  var p: ProtocolName { get set }
  var prop: AssociatedType { get }
}
typealias TypeAlias = EnumName
@attr(arg, *)
class ClassName<T> : ProtocolName {
  var property : ClassName
  var t : T
  func method(p: TypeAlias) {
    let c = ClassName(),
        tuple: (key: String, value: Int) = (key: 0, value: 1)
    self.property = c != nil ? c! : t
  }
  let prop: String
}

extension ClassName { }
extension StructName { }

let i: Int = (2 + 2) * 2;
let _ = { $0 }
let _ = { p in p }
let e = EnumName.Foo;
switch e {
  case .Foo: print("foo\n")
  default: print("""
      no foo \u{1F596}
      """)
}

func function<T>(externalName paramName : T) throws {
  func nestedFunc() { }
  nestedFunc()
  function(externalName: paramName + 1)
  throw NSError()
}

#if DEBUG
  print("debug")
#else
  print("nodebug")
#endif
#if swift(>=3.0)
  print("conditionally not parsed code")
#endif

/// Doc comment
/// - Parameter paramName:
/// - Returns: value
/// - Throws: description
foo(paramName: Int) throws -> Int { 0 }
