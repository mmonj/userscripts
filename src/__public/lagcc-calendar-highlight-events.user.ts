// ==UserScript==
// @name        lagcc: highlight academic calendar event
// @namespace   Violentmonkey Scripts
// @match       https://www.laguardia.edu/academic-calendar/
// @grant       none
// @version     1.0
// @author      -
// @description 9/6/2023, 6:22:26 PM
// ==/UserScript==

type TStyleProperty = {
  className: string;
  cssProperties: string;
  keywordTargets: (string | RegExp)[];
};

const DISABLED_CSS_CLASS = "mm-bg-disabled";
const GLOBAL_STYLES = `
  .${DISABLED_CSS_CLASS} {
    background-color: unset !important;
  }
  .visually-hidden {
    display: none !important;
  }
  .session-header:hover {
    cursor: pointer;
  }
`.trim();

const EVENT_STYLE_RULES: TStyleProperty[] = [
  {
    className: "mm-bg-danger",
    cssProperties: "background-color: #ff00004a; ",
    keywordTargets: ["college closed", "no classes scheduled", /\brecess *$/i],
  },
  {
    className: "mm-bg-warning",
    cssProperties: "background-color: #ffae0063; ",
    keywordTargets: ["irregular day"],
  },
  {
    className: "mm-bg-green",
    cssProperties: "background-color: #0291024a; ",
    keywordTargets: [/last day of \w+ classes/gi, /first day of( \w+){1,4}/gi],
  },
];

function main(): void {
  addStyles();
  highlightEvents();

  listenForClicks();
}

function highlightEvents(): void {
  const trNodes = document.querySelectorAll<HTMLElement>(".elementor-widget-container tbody tr");
  EVENT_STYLE_RULES.forEach((event) => {
    for (const trNode of trNodes) {
      const descriptionElement = [...trNode.children].at(-1) as HTMLElement | undefined;
      if (descriptionElement === undefined) {
        console.log("Description element does not exist for", trNode);
        continue;
      }

      if (
        event.keywordTargets.some((keywordSubstr) =>
          isMatchStringOrRegex(descriptionElement.innerText.toLowerCase(), keywordSubstr)
        )
      ) {
        descriptionElement.closest("tr")!.classList.add(event.className);
      }
    }
  });
}

function listenForClicks(): void {
  document.body.addEventListener("click", (event) => {
    const closestTableRow = (event.target as HTMLElement).closest("tr") as HTMLElement;
    if (closestTableRow === null) {
      return;
    }

    closestTableRow.classList.toggle("mm-bg-disabled");
  });

  document.querySelectorAll<HTMLElement>(".session-header").forEach((elm) => {
    elm.title = "Click to Hide/Show";

    elm.addEventListener("click", () => {
      elm.nextElementSibling!.classList.toggle("visually-hidden");
    });
  });
}

function isMatchStringOrRegex(
  referenceString: string,
  targetStringRegexp: string | RegExp
): boolean {
  return targetStringRegexp instanceof RegExp
    ? targetStringRegexp.exec(referenceString) !== null
    : referenceString.includes(targetStringRegexp);
}

function addStyles(): void {
  let stylesFinal = GLOBAL_STYLES;
  EVENT_STYLE_RULES.forEach((rule) => {
    stylesFinal += `
     .${rule.className} {
        ${rule.cssProperties}
     } 
    `.trim();
  });

  const newStylesheet = document.createElement("style");
  newStylesheet.classList.add("mm_stylesheet");
  newStylesheet.innerHTML = stylesFinal;

  document.head.append(newStylesheet);
}

setTimeout(main, 2000);

export {};
