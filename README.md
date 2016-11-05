# Vanilla BalanceText

A plugin to provide an alternate text wrapping algorithm.

*Converted to Vanilla based on [adobe-webplatform/balance-text](https://github.com/adobe-webplatform/balance-text) (which requires jQuery).*

The default text rendering algorithm is:

1. Add 1 word at a time to the current line until the next word won't fit.
2. Break text so that the next word starts on a new line.
3. Repeat until all text has been rendered.

That algorithm guarantees that the text is rendered using the least number of lines, but when text is centered and wraps to more than 1 line, it can produce visually undesirable results such as a long line of centered text followed by a short line of centered text. What I want is for the text to be balanced across lines. By "balanced across lines", I mean that the text is rendered so that the amount of text on each line is about the same. This plugin implements a line-breaking algorithm to do that automatically.

## How it works
Here is a simple Balance Text setup:

```html
<style>
/* Plugin looks for elements with class named "balance-text" */
.balance-text {
  text-wrap: balanced;  /* Apply (proposed) CSS style */
}
</style>

<script src="balancetext.min.js"></script>
<script>balanceText(document.querySelectorAll('.balance-text'));</script>
```

See the demo provided or [this online version for a working sample](https://qgustavor.github.io/vanilla-balance-text/demo/index.html).

You can use a DOM element or a array-like object (like `document.querySelectorAll`
or a jQuery object). If you need to re-balance elements you can simply call it again.

If you need restore some element to the previous state you can use:

```javascript
balanceText.disable(element);
```

Please note that as 3.0 this plugin handle **only** text-balancing. If you want
rebalancing on window resize it's up to you do that.

## Use from a CDN

This library isn't hosted in any JavaScript CDNs by now, only [RawGit](https://rawgit.com):

https://cdn.rawgit.com/qgustavor/vanilla-balance-text/7abd0ec1753bf0f829e0be2748cb6bd04c683066/balancetext.min.js

## Requirements
BalanceText is designed to run in most common browsers and implemented as a
vanilla JavaScript script (no dependencies). It can run alone (like in demo) or
along with frameworks and libraries (tested with React and React-lite).

Code is minified using [Closure Compiler](https://developers.google.com/closure/compiler/).

## Changelog
* v 1.0.x - Initial Release, bug fix by chrisbank, better break point detection mmcgahan
* v 1.1.0 - Fix bugs submitted by rodneyrehm, colmjude
* v 1.2.x - text-align:justify (hunterjm) line-height (jonathanpatt), right aligned text fix
* v 1.3.x - Debounce resizing events, more accurate space width estimate
* v 1.4.0 - Add support for nested tags (rileyjshaw)
* v 1.5.0 - Re-balance text on resize for manually triggered selectors (rileyjshaw)
* v 1.6.0 - Add balanceTextUpdate() method (rileyjshaw)
* v 2.0.0 - Removed jQuery dependency
* v 3.0.0 - Simplified code:
    * Not balancing elements based on '.balance-text' class
    * Not re-balancing elements on resize
    * Improved performance (plugin don't need to cache anything, like balanced elements, anymore)
