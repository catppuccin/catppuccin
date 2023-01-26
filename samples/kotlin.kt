/* Block comment */
package hello

import kotlin.collections.* // line comment

/**
 * Doc comment here for `SomeClass`
 * @see Iterator#next()
 */
@Deprecated(message = "Deprecated class")
private class MyClass<out T : Iterable<T>>(var prop1: Int) {
  fun foo(nullable: String?, r: Runnable, f: () -> Int, fl: FunctionLike, dyn: dynamic) {
    println("length\nis ${nullable?.length} \e")
    println(nullable!!.length)
    val ints = java.util.ArrayList<Int?>(2)
    ints[0] = 102 + f() + fl()
    val myFun = { -> "" };
    var ref = ints.size
    ints.lastIndex + globalCounter
    ints.forEach lit@{
      if (it == null) return@lit
      println(it + ref)
    }
    dyn.dynamicCall()
    dyn.dynamicProp = 5
    val klass = MyClass::class
    val year = java.time.LocalDate.now().year
  }

  override fun hashCode(): Int {
    return super.hashCode() * 31
  }
}

fun Int?.bar() {
  if (this != null) {
    println(message = toString())
  } else {
    println(this.toString())
  }
}

var globalCounter: Int = 5
  get() = field

abstract class Abstract {
  val bar get() = 1
  fun test() {
    bar
  }
}

object Obj

enum class E { A, B }

interface FunctionLike {
  operator fun invoke() = 1
}

typealias Predicate<T> = (T) -> Boolean

fun baz(p: Predicate<Int>) = p(42)

suspend fun suspendCall() =
  suspendFn()

suspend fun suspendFn() {}
