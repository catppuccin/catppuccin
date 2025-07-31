-- enable extensions so their syntax constructs are available for further down:
{-# LANGUAGE TypeFamilies #-}
{-# LANGUAGE ViewPatterns #-}
{-# LANGUAGE TypeApplications #-}
{-# LANGUAGE KindSignatures #-}
{-# LANGUAGE QuasiQuotes #-}
{-# LANGUAGE CPP #-}
{-# LANGUAGE BangPatterns #-}

-- disable some warnings:
{-# OPTIONS_GHC -Wno-unused-imports #-}
{-# OPTIONS_GHC -Wno-unused-top-binds #-}
{-# OPTIONS_GHC -Wno-redundant-constraints #-}


module Main
( main
) where


import Data.Functor ((<$>))
import qualified Data.List
import qualified Data.List as L
import Data.Either (isLeft, fromLeft)
import Data.Kind (Type)


-- | Docstring for `main`
main :: IO ()
main = do
  putStrLn "Hello, World!"


-- type and data constructors:

data SumType = Red | Green

data RecordSyntax = MkRec
  { field0 :: String
  , field1 :: Int
  } deriving (Show)

data GADT_syntax a where
  MkLit  :: Int  -> GADT_syntax Int
  MkBool :: Bool -> GADT_syntax Bool

data KindAnnotation (a :: Type) = MkKind a

newtype Newtype a = Newtype { unNewtype :: a }

type TypeAlias a b = Either a b


-- type classes:

class Monoid m => Group m where
  invert :: m -> m

instance Group [Int] where
  invert = reverse

type family F a where
  F Int  = Bool
  F Bool = Int


-- functions:

nullary :: Int
nullary = 1

unary :: Int -> Int
unary = \x -> x + 1

explicitForall :: forall a b. a -> b -> (a, b)
explicitForall = (,)

infixOp :: Int -> Int -> Int
infixOp = (+)
infixr 5 `infixOp`


-- patterns, pattern matching:

g :: [Int] -> Int
g []         = 0
g [x]        = x
g xs@(_:_:_) = sum xs

viewPattern :: String -> Int
viewPattern (length -> n) = n

typeGuard :: Int -> Bool
typeGuard x | x < 0     = False
            | otherwise = True

data Person = MkPerson { name :: String, age  :: String }

asPatternWithRecord :: Person -> String
asPatternWithRecord p@MkPerson{name = n} = n <> " is " <> age p

bangPattern :: Int -> Int
bangPattern !x = x + 1


-- constructs:

misc :: Maybe Int -> [Int]
misc x = case x of
  Just n  -> [n]
  Nothing -> letBinding 0 : listCompr
  where

    letBinding x =
      let y = x * 2
          z = y + 1
      in  z

    listCompr :: [Int]
    listCompr = [x * y | x <- [1..3], y <- [1..3], x < y]

    -- use a data constructor inside `where`:
    _temp = Just 1


doNotation :: IO Int
doNotation = do
  x <- return 5
  if (x > 0)
    then return (x + 1)
    else return (x - 1)

tuple :: (Int, String, Bool)
tuple = (42, "hello", True)

useQualImport :: [Int]
useQualImport = L.sort [1,2]

typeApplication :: Maybe Int
typeApplication = Just @Int 42

{-# SPECIALIZE compilerAnnotation :: Int -> Int #-}
compilerAnnotation :: Num a => a -> a
compilerAnnotation x = x + 1


-- CPP directives:

#ifdef DEBUG
debugMode :: Bool
debugMode = True
#else
debugMode :: Bool
debugMode = False
#endif
