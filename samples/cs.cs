using System;
// ReSharper disable All
#pragma warning disable 67
#pragma warning disable 169

class All(string key)
{
  /**
    * let's C# how it used to be
    */
  public delegate void EventHandler(object sender, EventArgs s);
  public event EventHandler Event;

  private int myField;

  [Obsolete]
  public All(int field, int property)
  {
    myField = field;
    Property = property;
  }

  public int Property { get; }

  private int Method(int parameter)
  {
    var mutable = Property ^ myField;
    var usual = 31 * parameter;
    mutable += usual + 13;
    return mutable;
  }

  private static int StaticMethod(int parameter)
  {
    unchecked
    {
      var usual = 31 * parameter;
      var sum = 0;
      var something = new { special = 13 };
      foreach (var number in new[] {1, 2, 3, 4, 5})
      {
        sum += number << 2;
#if !RELEASE
        Console.Write($"Trace: {sum} ({something.special})\r\n\r\n");
#endif
        Local();
      }

      void Local()
      {
        sum += usual + 13;
      }

      return sum;
    }
  }
}

public static class Util
{
  /// <summary>
  /// Checks of the properties of <see cref="IComparable"/> objects
  /// </summary>
  /// <param name="value">value to be checked</param>
  /// <typeparam name="T">type of the value</typeparam>
  /// <returns>true if the property holds</returns>
  public static bool CheckReflexivity<T>(this T value)
      where T : IComparable<T>
  {
      return value.CompareTo(value) == 0;
  }
}
