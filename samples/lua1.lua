local M = {}

M.test = {
		-- These groups are for the neovim tree-sitter highlights.
		-- As of writing, tree-sitter support is a WIP, group names may change.
		-- By default, most of these groups link to an appropriate Vim group,
		-- TSError -> Error for example, so you do not have to define these unless
		-- you explicitly want to support Treesitter's improved syntax awareness.
		TSField = { fg = cp.catppuccin10 }, -- For fields.
		TSProperty = { fg = cp.catppuccin5, style = "italic" }, -- Same as `TSField`.
		TSParameter = { fg = cp.catppuccin2, style = "italic" }, -- For parameters of a function.
		TSInclude = { fg = cp.catppuccin0, style = cnf.styles.keywords }, -- For includes: `#include` in C, `use` or `extern crate` in Rust, or `require` in Lua.
		TSOperator = { fg = cp.catppuccin0 }, -- For any operator: `+`, but also `->` and `*` in cp.
		TSKeywordOperator = { fg = cp.catppuccin0, style = cnf.styles.keywords }, -- For `new` keyword operator
		TSBoolean = { fg = cp.catppuccin6, style = cnf.styles.keywords }, -- For booleans.
		TSPunctSpecial = { fg = cp.catppuccin5 }, -- For special punctutation that does not fall in the catagories before.

		TSRepeat = { fg = cp.catppuccin3, style = cnf.styles.keywords }, -- For keywords related to loops.
		TSConditional = { fg = cp.catppuccin3, style = cnf.styles.keywords }, -- For keywords related to conditionnals.
		TSConstructor = { fg = cp.catppuccin9 }, -- For constructor calls and definitions: `= { }` in Lua, and Java constructors.

		-- builtin
		TSConstBuiltin = { fg = cp.catppuccin6, style = cnf.styles.keywords }, -- For constant that are built in the language: `nil` in Lua.
		TSFuncBuiltin = { fg = cp.catppuccin6 }, -- For builtin functions: `table.insert` in Lua.
		TSTypeBuiltin = { fg = cp.catppuccin8, style = cnf.styles.keywords }, -- For builtin types.
		TSVariableBuiltin = { fg = cp.catppuccin8, style = cnf.styles.keywords }, -- Variable names that are defined by the languages, like `this` or `self`.

		TSFunction = { fg = cp.catppuccin9, style = cnf.styles.functions }, -- For function (calls and definitions).
		TSFuncMacro = { fg = cp.catppuccin5 }, -- For macro defined functions (calls and definitions): each `macro_rules` in Ruscp.

		TSKeywordFunction = { fg = cp.catppuccin4, style = cnf.styles.keywords }, -- For keywords used to define a fuction.
		TSKeyword = { fg = cp.catppuccin4, style = cnf.styles.keywords }, -- For keywords that don't fall in previous categories.

		-- TSAnnotation        = { };    -- For C++/Dart attributes, annotations that can be attached to the code to denote some kind of meta information.
		-- TSAttribute         = { };    -- (unstable) TODO: docs
		-- TSCharacter         = { };    -- For characters.
		-- TScatppuccin11           = { };    -- For catppuccin11 blocks.
		TSNote = { fg = cp.catppuccin1, bg = cp.catppuccin9 },
		TSWarning = { fg = cp.catppuccin1, bg = cp.catppuccin8 },
		TSDanger = { fg = cp.catppuccin1, bg = cp.catppuccin5 },
		TSConstant = { fg = cp.catppuccin6 }, -- For constants
		-- TSConstMacro        = { };    -- For constants that are defined by macros: `NULL` in cp.
		-- TSError             = { };    -- For syntax/parser errors.
		TSException = { fg = cp.catppuccin3, style = cnf.styles.keywords }, -- For exception related keywords.
		-- rustTSField = { fg = cp.catppuccin12 }, -- For fields.
		-- TSFloat             = { };    -- For floats.
		TSLabel = { fg = cp.catppuccin9 }, -- For labels: `label:` in C and `:label:` in Lua.
		TSMethod = { fg = cp.catppuccin0, style = "italic" };    -- For method calls and definitions.
		TSNamespace = { fg = cp.catppuccin3, style = "italic" }, -- For identifiers referring to modules and namespaces.
		-- TSNone              = { };    -- TODO: docs
		TSNumber = { fg = cp.catppuccin6 };    -- For all numbers
		-- TSParameterReference= { };    -- For references to parameters of a function.
		tomlTSProperty = { fg = cp.catppuccin9 }, -- Differentiates between string and properties
		TSPunctDelimiter = { fg = cp.catppuccin11 }, -- For delimiters ie: `.`
		TSPunctBracket = { fg = cp.catppuccin11 }, -- For brackets and parenthesis.
		-- TSString            = { };    -- For strings.
		TSStringRegex = { fg = cp.catppuccin9, style = cnf.styles.strings }, -- For regexes.
		TSStringEscape = { fg = cp.catppuccin4, style = cnf.styles.strings }, -- For escape characters within a string.
		-- TSSymbol            = { };    -- For identifiers referring to symbols or atoms.
		-- TSType              = { };    -- For types.
		TSVariable = { style = cnf.styles.variables }, -- Any variable name that does not have another highlighcp.
		TSTagAttribute = { fg = cp.catppuccin3, style = "italic" };    -- Tags like html tag names.
		-- TSTag               = { };    -- Tags like html tag names.
		-- TSTagDelimiter      = { };    -- Tag delimiter like `<` `>` `/`
		-- TSText              = { };    -- For strings considecatppuccin5 text in a markup language.
		TSTextReference = { fg = cp.catppuccin2 },
		-- TSEmphasis          = { };    -- For text to be represented with emphasis.
		-- TSUnderline         = { };    -- For text to be represented with an underline.
		-- TSStrike            = { };    -- For strikethrough texcp.
		-- TSTitle             = { };    -- Text that is part of a title.
		-- TSLiteral           = { };    -- Literal texcp.
		-- TSURI               = { };    -- Any URI like a link or email.
	}

return M
