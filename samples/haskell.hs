{-# LANGUAGE CPP #-}
module ModuleName
import qualified ImportModuleName
"string literal"
'c'
intPair :: (Int, Int)
intPair = (456,434)
-- line comment
{- nested
comment -}
data Bool = True | False
let l1 = [1, 2]
let l2 = 1 : []
let two = 1 + 1
let f = \_ + 1
[t|select * from foo|]