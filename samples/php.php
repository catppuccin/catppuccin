<?php
$heredoc = <<< HEREDOC_ID
some $contents
HEREDOC_ID;

function foo() {
   $a = [0, 1, 2];
   return SomeClass::$shared;
}

// Sample comment

use AnotherClass as SomeAlias;
#[Attribute] class SomeClass extends One implements Another {
   #[Attribute(1, 2)] public $my;
   protected $myProtected;
   private $myPrivate;
   public static $shared;
   const CONSTANT = 0987654321;
   /**
    * Description by <a href="mailto:">user@host.dom</a>
    * @param $abc
    * @param $def
    * @property $magic
    * @method m()
    * @return SomeType
    */
   function doSmth($abc, $def, int $foo, SomeClass $bar) {
      /** @var SomeAlias $b */
      $b = new SomeAlias();
      foo();
      $def .=  self::magic;
      $def .=  self::CONSTANT;
      $v = Helper::convert(namedArgument: $abc . "\n {$def}" . $$def);
      $q = new Query( $this->invent(abs(0x80)) );
      $q = new Query( $this->protectedInvent(abs(0x80)) );
      $q = new Query( $this->privateInvent(abs(0x80)) );
      return array($v => $q->result);
   }
}

interface Another {
}

include (dirname(__FILE__) . "inc.php");
`rm -r`;

goto Label;

<p><?php echo "Hello, world!"?></p>

Label:
№