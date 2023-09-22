library libraryName;
import "dart:html" as html;
// Comment. Error. Warning. Hint.
dynamic topLevelVariable = "Escape sequences: \n \xFF \u1234 \u{2F}";
get topLevelGetter { return topLevelVariable; }
set topLevelSetter(bool parameter) { print(parameter); }
void topLevelFunction(dynamicParameter) {
  localFunction() {}
  num localVar = "Invalid escape sequences: \xZZ \uXYZZ \u{XYZ}";
  var dynamicLocalVar = dynamicParameter + localVar + localFunction();
  topLevelSetter = dynamicLocalVar + topLevelGetter + topLevelFunction(null);
  label: while (true) { if (identifier) break label; }
}
/* block comment */
class Foo<K, V> {
  static var staticField = staticGetter;
  List instanceField = [566];
  @deprecated Foo.constructor(this.instanceField) { instanceMethod(); }
  instanceMethod() { print(instanceField + instanceGetter); }
  get instanceGetter { instanceSetter = true; }
  set instanceSetter(_) { staticSetter = null; }
  static staticMethod() => staticField.unresolved();
  static get staticGetter { return staticMethod(); }
  static set staticSetter(Foo param) { #Enum.EnumConstant; }
}
/// documentation for [Enum]
enum Enum { EnumConstant }
mixin Mixin {}
typedef int FunctionTypeAlias(x, y);
extension Ext on int {}
±±§§``
