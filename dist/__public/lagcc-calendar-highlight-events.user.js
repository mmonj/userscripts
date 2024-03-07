// ==UserScript==
// @name        lagcc: highlight academic calendar event
// @namespace   Violentmonkey Scripts
// @match       https://www.laguardia.edu/academic-calendar/
// @grant       none
// @version     1.0
// @author      -
// @description 9/6/2023, 6:22:26 PM
// ==/UserScript==

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const DANGER_CSS_CLASS = "mm-bg-danger";
  const WARNING_CSS_CLASS = "mm-bg-warning";
  const GREEN_CSS_CLASS = "mm-bg-green";
  const DISABLED_CSS_CLASS = "mm-bg-disabled";
  const NEW_STYLES1 = `
.${DANGER_CSS_CLASS} {
  background-color: #ff00004a;
}
.${WARNING_CSS_CLASS} {
  background-color: #ffae0063;
}
.${GREEN_CSS_CLASS} {
  background-color: #0291024a;
}
.${DISABLED_CSS_CLASS} {
  background-color: unset !important;
}
.visually-hidden {
  display: none !important;
}
.session-header:hover {
  cursor: pointer;
}
`;
  const RED_HIGHLIGHT_KEYWORDS = ["college closed", "no classes scheduled", /\brecess *$/i];
  const YELLOW_HIGHLIGHT_KEYWORDS = ["irregular day"];
  const GREEN_HIGHLIGHT_KEYWORDS = [/last day of \w+ classes/gi, /first day of( \w+){1,4}/gi];
  function main() {
    addCustomStyle(NEW_STYLES1);
    listenForClicks();
    console.log("Begin: Highlighting all stuff");
    highlightRowByKeywords(RED_HIGHLIGHT_KEYWORDS, DANGER_CSS_CLASS);
    highlightRowByKeywords(YELLOW_HIGHLIGHT_KEYWORDS, WARNING_CSS_CLASS);
    highlightRowByKeywords(GREEN_HIGHLIGHT_KEYWORDS, GREEN_CSS_CLASS);
    console.log("End: Highlighting all stuff");
    document.querySelectorAll(".session-header").forEach((elm) => {
      elm.title = "Click to Hide/Show";
      elm.addEventListener("click", () => {
        elm.nextElementSibling.classList.toggle("visually-hidden");
      });
    });
  }
  function listenForClicks() {
    document.body.addEventListener("click", (event) => {
      const closestTableRow = event.target.closest("tr");
      if (closestTableRow === null) {
        return;
      }
      closestTableRow.classList.toggle("mm-bg-disabled");
    });
  }
  function highlightRowByKeywords(keywords, className) {
    const tdNodes = document.querySelectorAll("td");
    for (const tdNode of tdNodes) {
      if (keywords.some(
        (keywordSubstr) => isMatchStringOrRegex(tdNode.innerText.toLowerCase(), keywordSubstr)
      )) {
        tdNode.closest("tr").classList.add(className);
      }
    }
  }
  function isMatchStringOrRegex(referenceString, targetStringRegexp) {
    return targetStringRegexp instanceof RegExp ? targetStringRegexp.exec(referenceString) !== null : referenceString.includes(targetStringRegexp);
  }
  function addCustomStyle(cssStr) {
    const newStylesheet = document.createElement("style");
    newStylesheet.classList.add("mm_stylesheet");
    newStylesheet.type = "text/css";
    newStylesheet.innerHTML = cssStr;
    document.head.append(newStylesheet);
  }
  setTimeout(main, 2e3);

}));
