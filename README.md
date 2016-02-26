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
  <style type="text/css">
  /* Plugin looks for elements with class named "balance-text" */
  .balance-text {
      text-wrap: balanced;  /* Apply (proposed) CSS style */
  }
  </style>

  <script src="balancetext.min.js"></script>
```

See the demo provided or [this online version for a working sample](https://qgustavor.github.io/vanilla-balance-text/demo/index.html).

Balance Text will *automatically* run on any elements with <code>.balance-text</code> class:

- when the page loads (DOM Ready event)
- when it is resized

You may also *manually* trigger it, e.g. if you're dynamically adding text to the DOM:

```javascript
    balanceText(document.querySelector('.my-class'));
```

You can use any selector of your choice (you may wish to use an ID or restrict the scope for performance). These will re-balance on resize.

If you need to manually re-balance all triggered elements, use:

```javascript
    balanceText.update();
```

## Use from a CDN

*This library isn't hosted in any CDNs by now.*

## Requirements
BalanceText is designed to run in most common browsers and implemented as a vanilla JS plugin.

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
