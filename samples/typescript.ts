module ModuleValidator {
    import checkChars = CharUtils.notWhiteSpace

    export interface HasValidator<T> {
        validateValue(): Boolean
    }

    type FooBarAlias = string

    @decorator()
    class HasValidator implements HasValidator<String> {
        /* Processed values */
        static validatedValue: Array<String> = ['', 'aa']
        private myValue: String

        /**
         * Constructor for class
         * @param valueParameter Value for <i>validation</i>
         */
        constructor(valueParameter: String) {
            this.myValue = valueParameter
            HasValidator.validatedValue.push(value)
        }

        public validateValue(): Boolean {
            var resultValue: Boolean = checkChars(this.myValue)
            return resultValue
        }

        static createInstance(valueParameter: string): HasValidator {
            return new HasValidator(valueParameter)
        }
    }

    function globalFunction<TypeParameter>(value: TypeParameter) {
        //global function
        return 42
    }

    declare var declareUrl
    var varUrl = declareUrl.replace(/^\s*(.*)/, '$1').concat('\u1111z\n\u0022')
    var html = `<div title='HTML injection'>Injected language fragment</div>`
    var hello = () => console.log('hello')
    HasValidator.createInstance(varUrl).validateValue()

    function acceptsUnion(s: string | number) {
        if (typeof s === 'string') {
            s
        }
    }

    enum EnumName {
        EnumMember,
    }
}
