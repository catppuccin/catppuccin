"use strict";

/**
 * Color Contast Checker
 * An accessibility checker tool for validating the color contrast based on WCAG 2.0 standard.
 * var ccc = new ColorContrastChecker();

 * var color1 = "#FFFFFF";
 * var color2 = "#000000;

 * if (ccc.isLevelAA(color1, color2, 14)) {
 *     alert("Valid Level AA");
 * } else {
 *     alert("Invalid Contrast");
 * }
 */

function ColorContrastChecker() {};

module.exports = ColorContrastChecker;

ColorContrastChecker.prototype = {
    fontSize: 14,
    rgbClass : {
        toString: function() {
            return "<r: " + this.r +
                " g: " + this.g +
                " b: " + this.b +
                " >";
        }
    },
    isValidSixDigitColorCode: function (hex){
        var regSixDigitColorcode = /^(#)?([0-9a-fA-F]{6})?$/;
        return regSixDigitColorcode.test(hex);
    },
    isValidThreeDigitColorCode: function (hex){
        var regThreeDigitColorcode = /^(#)?([0-9a-fA-F]{3})?$/;
        return regThreeDigitColorcode.test(hex);
    },
    isValidColorCode : function (hex){
        return this.isValidSixDigitColorCode(hex) || this.isValidThreeDigitColorCode(hex);
    },
    isValidRatio : function (ratio){
        return (typeof ratio === "number");
    },
    convertColorToSixDigit: function (hex) {
        return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    },
    hexToLuminance: function (color) {
        if (!this.isValidColorCode(color)) {
            throw new Error("Invalid Color :" + color);
        }

        if (this.isValidThreeDigitColorCode(color)) {
            color = this.convertColorToSixDigit(color);
        }

        color = this.getRGBFromHex(color);

        var LRGB = this.calculateLRGB(color);

        return this.calculateLuminance(LRGB);
    },
    check: function (colorA, colorB, fontSize, customRatio) {
        if (typeof fontSize !== "undefined") {
            this.fontSize = fontSize;
        }

        if(!colorA || !colorB) {
            return false;
        }

        var l1 = this.hexToLuminance(colorA); /* higher value */
        var l2 = this.hexToLuminance(colorB); /* lower value */
        var contrastRatio = this.getContrastRatio(l1, l2);

        if (typeof customRatio !== "undefined") {
            if (!this.isValidRatio(customRatio)) {
                return false;
            }
            return this.verifyCustomContrastRatio(contrastRatio, customRatio);
        } else {
            return this.verifyContrastRatio(contrastRatio);
        }   
    },
    checkPairs: function (pairs, customRatio) {
        var results = [];

        for (var i in pairs) {
            var pair = pairs[i];
            if (typeof pair.fontSize !== "undefined") {
                results.push(
                    this.check(
                        pair.colorA,
                        pair.colorB,
                        pair.fontSize,
                        customRatio
                    )
                );
            } else {
                results.push(
                    this.check(
                        pair.colorA,
                        pair.colorB,
                        void 0,
                        customRatio
                    )
                );
            }
        }
        return results;
    },
    calculateLuminance: function(lRGB) {
        return (0.2126 * lRGB.r) + (0.7152 * lRGB.g) + (0.0722 * lRGB.b);
    },
    isLevelAA : function(colorA, colorB, fontSize) {
        var result = this.check(colorA, colorB, fontSize);
        return result.WCAG_AA;
    },
    isLevelAAA : function(colorA, colorB, fontSize) {
        var result = this.check(colorA, colorB, fontSize);
        return result.WCAG_AAA; 
    },
    isLevelCustom : function(colorA, colorB, ratio) {
        var result = this.check(colorA, colorB, void 0, ratio);
        return result.customRatio;
    },
    getRGBFromHex : function(color) {

        var rgb = Object.create(this.rgbClass),
            rVal,
            gVal,
            bVal;

        if (typeof color !== "string") {
            throw new Error("must use string");
        }

        rVal = parseInt(color.slice(1, 3), 16);
        gVal = parseInt(color.slice(3, 5), 16);
        bVal = parseInt(color.slice(5, 7), 16);

        rgb.r = rVal;
        rgb.g = gVal;
        rgb.b = bVal;

        return rgb;
    },
    calculateSRGB : function(rgb) {
        var sRGB = Object.create(this.rgbClass),
            key;

        for (key in rgb) {
            if (rgb.hasOwnProperty(key)) {
                sRGB[key] = parseFloat((rgb[key] / 255), 10);
            }
        }

        return sRGB;
    },
    calculateLRGB: function (rgb) {
        var sRGB = this.calculateSRGB(rgb);
        var lRGB = Object.create(this.rgbClass),
            key,
            val = 0;

        for (key in sRGB) {
            if (sRGB.hasOwnProperty(key)) {
                val = parseFloat(sRGB[key], 10);
                if (val <= 0.03928) {
                    lRGB[key] = (val / 12.92);
                } else {
                    lRGB[key] = Math.pow(((val + 0.055) / 1.055), 2.4);
                }
            }
        }

        return lRGB;
    },
    getContrastRatio : function(lumA, lumB) {
        var ratio,
            lighter,
            darker;

        if (lumA >= lumB) {
            lighter = lumA;
            darker = lumB;
        } else {
            lighter = lumB;
            darker = lumA;
        }

        ratio = (lighter + 0.05) / (darker + 0.05);

        return ratio;
    },
    verifyContrastRatio : function(ratio) {


        var resultsClass = {
            toString: function() {
                return "< WCAG-AA: " + ((this.WCAG_AA) ? "pass" : "fail") +
                    " WCAG-AAA: " + ((this.WCAG_AAA) ? "pass" : "fail") +
                    " >";
            }
        };
        var WCAG_REQ_RATIO_AA_LG = 3.0,
            WCAG_REQ_RATIO_AA_SM = 4.5,
            WCAG_REQ_RATIO_AAA_LG = 4.5,
            WCAG_REQ_RATIO_AAA_SM = 7.0,
            WCAG_FONT_CUTOFF = 18;

        var results = Object.create(resultsClass),
            fontSize = this.fontSize || 14;

        if (fontSize >= WCAG_FONT_CUTOFF) {
            results.WCAG_AA = (ratio >= WCAG_REQ_RATIO_AA_LG);
            results.WCAG_AAA = (ratio >= WCAG_REQ_RATIO_AAA_LG);
        } else {
            results.WCAG_AA = (ratio >= WCAG_REQ_RATIO_AA_SM);
            results.WCAG_AAA = (ratio >= WCAG_REQ_RATIO_AAA_SM);
        }

        return results;
    },
    verifyCustomContrastRatio : function(inputRatio, checkRatio) {

        var resultsClass = {
            toString: function() {
                return "< Custom Ratio: " + ((this.customRatio) ? "pass" : "fail") +
                    "  >";
            }
        };

        var results = Object.create(resultsClass);

        results.customRatio = (inputRatio >= checkRatio);
        return results;
    }

};
