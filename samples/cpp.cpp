/*
 * Block comment
 */
#include <cstdio>
#include <vector>

using namespace std;  // line comment
namespace foo {

  typedef struct Struct {
    int field;
  } Typedef;
  enum Enum {Foo = 1, Bar = 2};

  Typedef *globalVar;
  extern Typedef *externVar;

  template<typename T, int N>
  class Class {
    T n;
  public:
    void function(int param1, int param2, int param3) {
      int localVar1, localVar2, localVar3;
      int *localVar = new int[1];
      std::vector<int> vec = { 1, 2, 3 };
      this->n = N;
      localVar1 = param1 + param2 + localVar3;

    label:
      printf("Formatted string %d\n\g", localVar[0]);
      printf(R"**(Formatted raw-string %d\n)**", 1);
      std::cout << (1 << 2) << std::endl;

    /**
     * Macro documentation comment
     * @param A description
     */
    #define FOO(A) A
    #ifdef DEBUG
      printf("debug");
    #endif
    }
  };

  template <typename T>
  concept Concept = requires (T t) {
    t.field;
  };

  template<typename T>
  struct Widget {
      Widget(T t);
  };

  template<typename T>
  Widget(T) -> Widget<typename T::value_type>;
}
