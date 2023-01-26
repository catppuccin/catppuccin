import scala.collection.mutable._
import java.util.TreeMap

/**
 * ScalaDoc comment: <code>Some code</code>
 * Html escape sequence &#94;
 * ''Text''
 *
 * @param x Int param
 * @author IntelliJ
 */
class ScalaClass(x: Int) extends ScalaObject {
  1 to 5
  (x: Int) => x
  val field = "Some\nStrin\g"

  def foo(x: Float, y: Float) = {
    def empty = 2

    val local = 1000 - empty
    Math.sqrt(x + y + local); //this can crash
  }

  def t[T]: T = null

  foo(0, -1) match {
    case x => x
  }
  type G = Int
  val xml = <element attibute="value">data</element>
}

/*
  And now ScalaObject
 */
object Object {
  val layer = -5.0
  val mutableCollection = HashMap[Int, Int]()
  val immutableCollection = List(1, 2)
  val javaCollection = new TreeMap[Int, Int]()

  def foo: ScalaClass = new ScalaClass(23, 9)
}

@Annotation(2) {val name = value}
trait Trait {
}

abstract class SomeAbstract {
  for (x <- list) {
    x
  }
}
