# Color Contast Checker

An accessibility checker tool for validating the color contrast based on WCAG 2.0 and WCAG 2.1 standard.

The formula (L1/L2) for contrast is based on [ISO-9241-3] and [ANSI-HFES-100-1988] standards as described here :

http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
http://www.w3.org/TR/WCAG20/#contrast-ratiodef
https://www.w3.org/TR/WCAG21/#contrast-minimum

It also supports shorthand color codes e.g #FFF or #000 etc.

https://www.w3.org/TR/2001/WD-css3-color-20010305#colorunits

Installation:
------------

```
npm install color-contrast-checker
```
or using package.json

```
{
  "name": "my-app",
  ..
  "devDependencies": {
    ..
    "color-contrast-checker": "2.1.0"
  }
}
```
Then do `npm install`

Usage:
-----

To check specific WCAG levels
```
var ccc = new ColorContrastChecker();

var color1 = "#FFFFFF";
var color2 = "#000000;

if (ccc.isLevelAA(color1, color2, 14)) {
    alert("Valid Level AA");
} else {
    alert("Invalid Contrast");
}

```

To check custom ratios
```
var ccc = new ColorContrastChecker();

var color1 = "#FFFFFF";
var color2 = "#000000;
var customRatio = 5.7;

// No need for font size, now that we are using a custom ratio.
// This is because we are no longer checking against WCAG requirements.
if (ccc.isLevelCustom(color1, color2, customRatio)) {
    alert("Above given ratio");
} else {
    alert("Invalid Contrast");
}

```

Advanced Usage:
--------------

You can pass pairs and get results:


```
    var pairs = [
        {
            'colorA': '#000000',
            'colorB': '#000000',  // All should fail
            'fontSize': 14
        },
        {
            'colorA': '#000000',
            'colorB': '#FFFFFF',  //All should pass
            'fontSize': 14
        },
        {
            'colorA': '#000000',
            'colorB': '#848484',  //AAA should fail
            'fontSize': 14
        },
        {
            'colorA': '#000000',
            'colorB': '#848484',  //All should pass (because of font)
            'fontSize': 19
        },
        {
            'colorA': '#000000',
            'colorB': '#757575',  //AA should pass AAA should fail
            'fontSize': 14
        },
        {
            'colorA': '#000000',
            'colorB': '#656565',  //All should fail
            'fontSize': 14
        }
    ];

    var results = ccc.checkPairs(pairs);

```

The result will look like this:

```
[
    {
        'WCAG_AA' : false,
        'WCAG_AAA': false
    },
    {
        'WCAG_AA' : true,
        'WCAG_AAA': true
    },
    {
        'WCAG_AA' : true,
        'WCAG_AAA': false
    },
    {
        'WCAG_AA' : true,
        'WCAG_AAA': true
    },
    {
        'WCAG_AA' : true,
        'WCAG_AAA': false
    },
    {
        'WCAG_AA' : false,
        'WCAG_AAA': false
    }
]
```

## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
