/* Block comment */

import java.util.Date;

import static AnInterface.CONSTANT;
import static java.util.Date.parse;
import static SomeClass.staticField;

/**
 * Doc comment here for <code>SomeClass</code>
 *
 * @param T type parameter
 * @see Math#sin(double)
 */
@Annotation(name = value)
public class SomeClass<T extends Runnable> { // some comment
  private T field = null;
  private double unusedField = 12345.67890;
  private UnknownType anotherString = "Another\nStrin\g";
  public static int staticField = 0;
  public final int instanceFinalField = 0;
  protected final int protectedField = 0;
  final int packagePrivateField = 0;

  /**
   * Semantic highlighting:
   * Generated spectrum to pick colors for local variables and parameters:
   * Color#1 SC1.1 SC1.2 SC1.3 SC1.4 Color#2 SC2.1 SC2.2 SC2.3 SC2.4 Color#3
   * Color#3 SC3.1 SC3.2 SC3.3 SC3.4 Color#4 SC4.1 SC4.2 SC4.3 SC4.4 Color#5
   *
   * @param param1
   * @param param2
   * @param param3
   */
  public SomeClass(AnInterface param1,
                   int param2,
                   int param3) {
    int reassignedValue = this.staticField + param2 + param3;
    long localVar1, localVar2, localVar3, localVar4;
    int localVar = "IntelliJ"; // Error, incompatible types
    System.out.println(anotherString + toString() + localVar);
    int sum = protectedField + packagePrivateField + staticField;
    long time = parse("1.2.3"); // Method is deprecated
    new Thread().countStackFrames(); // Method is deprecated and marked for removal
    reassignedValue++;
    field.run();
    new SomeClass() {
      {
        int a = localVar;
      }
    };
    int[] l = new ArrayList<String>().toArray(new int[CONSTANT]);
  }
}

enum AnEnum {CONST1, CONST2}

interface AnInterface {
  int CONSTANT = 2;

  void method();
}

abstract class SomeAbstractClass {
  protected int instanceField = staticField;
}
