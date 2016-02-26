/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. *
 */
/**
 * balancetext.js
 *
 * Author: Randy Edmunds
 */

/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*jshint laxbreak: true */

/*
 * Copyright (c) 2007-2009 unscriptable.com and John M. Hann
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the “Software”), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * Except as contained in this notice, the name(s) of the above
 * copyright holders (unscriptable.com and John M. Hann) shall not be
 * used in advertising or otherwise to promote the sale, use or other
 * dealings in this Software without prior written authorization.
 *
 * http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
 *
 */
(function (global) {
    "use strict";

    var debounce = function (func, threshold, execAsap) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                if (!execAsap) {
                    func.apply(obj, args);
                }
                timeout = null;
            }

            if (timeout) {
                clearTimeout(timeout);
            } else if (execAsap) {
                func.apply(obj, args);
            }
            timeout = setTimeout(delayed, threshold || 100);
        };
    };

    // smartresize
    window.smartresize = function (target, fn) {
      if (!target.length) {
        target = [target];
      }
      for (var i = 0; i < target.length; i++) {
        if (fn) {
          target[i].addEventListener('resize', debounce(fn));
        } else {
          var event = document.createEvent('HTMLEvents');
          event.initEvent('resize', true, false);
          target[i].dispatchEvent(event);
        };
      }
    }
}(window));


(function (global) {
    "use strict";

    var style = document.documentElement.style,
        hasTextWrap = (style.textWrap || style.WebkitTextWrap || style.MozTextWrap || style.MsTextWrap || style.OTextWrap),
        wsMatches;

    function NextWS_params() {
        this.reset();
    }
    NextWS_params.prototype.reset = function () {
        this.index = 0;
        this.width = 0;
    };

    /**
     * Returns true iff char at index is a space character outside of HTML < > tags.
     */
    var isWS = function (txt, index) {
        var re = /\s(?![^<]*>)/g,
            match;

        if (!wsMatches) {
            // Only calc ws matches once per line
            wsMatches = [];
            while ((match = re.exec(txt)) !== null) {
                wsMatches.push(match.index);
            }
        }

        return wsMatches.indexOf(index) !== -1;
    };

    var removeTags = function (el) {
        var breakElements = el.querySelectorAll('br[data-owner="balance-text"]');
        for (var i = 0; i < breakElements.length; i++) {
          breakElements[i].parentNode.removeChild(breakElements[i]);
        }
        var span = el.querySelectorAll('span[data-owner="balance-text"]');
        if (span.length > 0) {
            var txt = '';
            for (var i = 0 ; i < span.length; i++) {
                txt += span[i].textContent;
                span[i].parentNode.removeChild(span[i]);
            }
            el.innerHTML = txt;
        }
    };

    /**
     * Checks to see if we should justify the balanced text with the
     * element based on the textAlign property in the computed CSS
     *
     * @param el        - element
     */
    var isJustified = function (el) {
        style = el.currentStyle || window.getComputedStyle(el, null);
        return (style.textAlign === 'justify');
    };

    /**
     * Add whitespace after words in text to justify the string to
     * the specified size.
     *
     * @param txt      - text string
     * @param conWidth - container width
     */
    var justify = function (el, txt, conWidth) {
        txt = txt.trim();
        var words = txt.split(' ').length;
        txt = txt + ' ';

        // if we don't have at least 2 words, no need to justify.
        if (words < 2) {
            return txt;
        }

        // Find width of text in the DOM
        var tmp = document.createElement('span');
        tmp.innerHTML = txt;
        el.appendChild(tmp);
        var size = tmp.getBoundingClientRect().width;
        el.removeChild(tmp);

        // Figure out our word spacing and return the element
        var wordSpacing = Math.floor((conWidth - size) / (words - 1));
        tmp.style.wordSpacing = wordSpacing + 'px';
        tmp.setAttribute('data-owner', 'balance-text');

        return getHTML(tmp);
    };

    function getHTML(node){
        if(!node || !node.tagName) return '';
        if(node.outerHTML) return node.outerHTML;
    
        // polyfill:
        var wrapper = document.createElement('div');
        wrapper.appendChild(node.cloneNode(true));
        return wrapper.innerHTML;
    }

    /**
     * In the current simple implementation, an index i is a break
     * opportunity in txt iff it is 0, txt.length, or the
     * index of a non-whitespace char immediately preceded by a
     * whitespace char.  (Thus, it doesn't honour 'white-space' or
     * any Unicode line-breaking classes.)
     *
     * @precondition 0 <= index && index <= txt.length
     */
    var isBreakOpportunity = function (txt, index) {
        return ((index === 0) || (index === txt.length) ||
                (isWS(txt, index - 1) && !isWS(txt, index)));
    };

    /**
     * Finds the first break opportunity (@see isBreakOpportunity)
     * in txt that's both after-or-equal-to index c in the direction dir
     * and resulting in line width equal to or past clamp(desWidth,
     * 0, conWidth) in direction dir.  Sets ret.index and ret.width
     * to the corresponding index and line width (from the start of
     * txt to ret.index).
     *
     * @param el      - element
     * @param txt      - text string
     * @param conWidth - container width
     * @param desWidth - desired width
     * @param dir      - direction (-1 or +1)
     * @param c        - char index (0 <= c && c <= txt.length)
     * @param ret      - return object; index and width of previous/next break
     *
     */
    var findBreakOpportunity = function (el, txt, conWidth, desWidth, dir, c, ret) {
        var w;
        if (txt && typeof txt === 'string') {
            for(;;) {
                while (!isBreakOpportunity(txt, c)) {
                    c += dir;
                }

                el.innerHTML = txt.substr(0, c);
                w = el.getBoundingClientRect().width;

                if ((dir < 0)
                        ? ((w <= desWidth) || (w <= 0) || (c === 0))
                        : ((desWidth <= w) || (conWidth <= w) || (c === txt.length))) {
                    break;
                }
                c += dir;
            }
        }
        ret.index = c;
        ret.width = w;
    };

    /**
     * Detects the width of a non-breaking space character, given the height of
     * the element with no-wrap applied.
     *
     * @param $el      - element
     * @param h         - height
     *
     */
    var getSpaceWidth = function (el, h) {
        var container = document.createElement('div');

        container.style.display = "block";
        container.style.position = "absolute";
        container.style.bottom = 0;
        container.style.right = 0;
        container.style.width = 0;
        container.style.height = 0;
        container.style.margin = 0;
        container.style.padding = 0;
        container.style.visibility = "hidden";
        container.style.overflow = "hidden";

        var space = document.createElement('span');

        space.style.fontSize = "2000px";
        space.innerHTML = "&nbsp;";

        container.appendChild(space);

        el.appendChild(container);

        var dims = space.getBoundingClientRect();
        container.parentNode.removeChild(container);

        var spaceRatio = dims.height / dims.width;

        return (h / spaceRatio);
    };

    // Selectors to watch; calling balanceText() on a new selector adds it to this list.
    var balancedElements = [];
    var addedElementsByClassName = false;

    // Call the balanceText plugin on the elements with "balance-text" class. When a browser
    // has native support for the text-wrap property, the text balanceText plugin will let
    // the browser handle it natively, otherwise it will apply its own text balancing code.
    var applyBalanceText = function () {
        if (!addedElementsByClassName) {
          addedElementsByClassName = true;
          var elements = document.querySelectorAll('.balance-text');
          for (var i = 0; i < elements.length; i++) {
            balancedElements.push(elements[i]);
          }
        }
        for (var i = 0; i < balancedElements.length; i++) {
          balanceText(balancedElements[i], true);
        }
    };

    var balanceText = function (elements, skipResize) {
        if (!elements.length) {
          elements = [elements];
        }
        
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            if (!skipResize && balancedElements.indexOf(element) === -1) {
                // record the selector so we can re-balance it on resize
                balancedElements.push(element);
            }

            if (hasTextWrap) {
                // browser supports text-wrap, so do nothing
                return;
            }

            // In a lower level language, this algorithm takes time
            // comparable to normal text layout other than the fact
            // that we do two passes instead of one, so we should
            // be able to do without this limit.
            var maxTextWidth = 5000;

            removeTags(element);                        // strip balance-text tags

            // save settings
            var oldWS = element.style.whiteSpace;
            var oldFloat = element.style.float;
            var oldDisplay = element.style.display;
            var oldPosition = element.style.position;
            var oldLH = element.style.lineHeight;

            // remove line height before measuring container size
            element.style.lineHeight = 'normal';

            var containerBoundingRect = element.getBoundingClientRect();
            var containerWidth = containerBoundingRect.width;
            var containerHeight = containerBoundingRect.height;

            // temporary settings
            element.style.whiteSpace = 'nowrap';
            element.style.cssFloat = 'none';
            element.style.display = 'inline';
            element.style.position = 'static';

            var nowrapBoundingRect = element.getBoundingClientRect();
            var nowrapWidth = nowrapBoundingRect.width;
            var nowrapHeight = nowrapBoundingRect.height;

            // An estimate of the average line width reduction due
            // to trimming trailing space that we expect over all
            // lines other than the last.

            var spaceWidth = ((oldWS === 'pre-wrap') ? 0 : getSpaceWidth(element, nowrapHeight));

            if (containerWidth > 0 &&                  // prevent divide by zero
                    nowrapWidth > containerWidth &&    // text is more than 1 line
                    nowrapWidth < maxTextWidth) {      // text is less than arbitrary limit (make this a param?)

                var remainingText = element.innerHTML;
                var newText = "";
                var lineText = "";
                var shouldJustify = isJustified(element);
                var totLines = Math.round(containerHeight / nowrapHeight);
                var remLines = totLines;

                // Determine where to break:
                while (remLines > 1) {

                    // clear whitespace match cache for each line
                    wsMatches = null;

                    var desiredWidth = Math.round((nowrapWidth + spaceWidth)
                                                  / remLines
                                                  - spaceWidth);

                    // Guessed char index
                    var guessIndex = Math.round((remainingText.length + 1) / remLines) - 1;

                    var le = new NextWS_params();

                    // Find a breaking space somewhere before (or equal to) desired width,
                    // not necessarily the closest to the desired width.
                    findBreakOpportunity(element, remainingText, containerWidth, desiredWidth, -1, guessIndex, le);

                    // Find first breaking char after (or equal to) desired width.
                    var ge = new NextWS_params();
                    guessIndex = le.index;
                    findBreakOpportunity(element, remainingText, containerWidth, desiredWidth, +1, guessIndex, ge);

                    // Find first breaking char before (or equal to) desired width.
                    le.reset();
                    guessIndex = ge.index;
                    findBreakOpportunity(element, remainingText, containerWidth, desiredWidth, -1, guessIndex, le);

                    // Find closest string to desired length
                    var splitIndex;
                    if (le.index === 0) {
                        splitIndex = ge.index;
                    } else if ((containerWidth < ge.width) || (le.index === ge.index)) {
                        splitIndex = le.index;
                    } else {
                        splitIndex = ((Math.abs(desiredWidth - le.width) < Math.abs(ge.width - desiredWidth))
                                           ? le.index
                                           : ge.index);
                    }

                    // Break string
                    lineText = remainingText.substr(0, splitIndex);
                    if (shouldJustify) {
                        newText += justify(element, lineText, containerWidth);
                    } else {
                        newText += lineText.replace(/\s$/, "");
                        newText += '<br data-owner="balance-text" />';
                    }
                    remainingText = remainingText.substr(splitIndex);

                    // update counters
                    remLines--;
                    element.innerHTML = remainingText;
                    nowrapWidth = element.getBoundingClientRect().width;
                }

                if (shouldJustify) {
                    element.innerHTML = newText + justify(element, remainingText, containerWidth);
                } else {
                    element.innerHTML = newText + remainingText;
                }
            }

            // restore settings
            element.style.whiteSpace = oldWS;
            element.style.cssFloat = oldFloat;
            element.style.display = oldDisplay;
            element.style.position = oldPosition;
            element.style.lineHeight = oldLH;
        }
    };

    // Export functions
    global.balanceText = balanceText;
    global.balanceText.update = applyBalanceText;
    global.balanceText.removeTags = removeTags;

    // Apply on DOM ready
    if (document.readyState != 'loading'){
      applyBalanceText();
    } else {
      document.addEventListener('DOMContentLoaded', applyBalanceText);
    }

    // Reapply on resize
    smartresize(window, applyBalanceText);
}(typeof module !== 'undefined' && module.exports ? module.exports : self || {}));
