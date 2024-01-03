// ==UserScript==
// @name        crossmark.com - auto-click on workday
// @namespace   Violentmonkey Scripts
// @match       https://retailtimesheet.crossmark.com/
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description 1/1/2024, 3:16:42 PM
// ==/UserScript==

import {
  DAYS_OF_WEEK,
  getAutoTimekeepingLocalstorage,
  getDefaultAutoTimekeepingData,
  isAllowAutoSubmit,
  isTimeAcknowledgementCompleted,
  isTravelTimeCompleted,
  logDayStatus,
  setAutoTimekeepingLocalstorage,
} from "./util/crossmarkTimekeeping";
import { AUTO_TIMEKEEPING_DATA_TYPE } from "./util/crossmarkTimekeeping/types";

function main() {
  const autoTimekeepingData = getAutoTimekeepingLocalstorage();
  logDayStatus(autoTimekeepingData);

  if (!isAllowAutoSubmit(autoTimekeepingData)) {
    console.warn(`Not allowed to auto submit. Exiting`);
    return;
  }

  if (
    isTravelTimeCompleted(autoTimekeepingData) &&
    isTimeAcknowledgementCompleted(autoTimekeepingData)
  ) {
    console.log("Time Acknowledgement completed.");
    clickOnDay(autoTimekeepingData.currentHighlightedDay + 1, autoTimekeepingData);
  } else {
    if (!isTravelTimeCompleted(autoTimekeepingData)) {
      console.log("Travel time NOT completed");
      clickTravelDetails();
    } else if (!isTimeAcknowledgementCompleted(autoTimekeepingData)) {
      console.log("Time Acknowledgement NOT completed");
      clickTimeAcknowledgement();
    }
  }

  logDayStatus(autoTimekeepingData);
}

function clickTravelDetails() {
  document.querySelector<HTMLElement>("a[href='/DTMs/DTM']")!.click();
}

function clickTimeAcknowledgement() {
  document
    .querySelector<HTMLElement>("a[href='/StartEndTimeAndAcks/StartEndTimeAndAcks']")!
    .click();
}

function clickOnDay(newDayNumber: number, autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  if (newDayNumber > 6) {
    console.warn("No day past 6 available. Returning.");
    return;
  }

  const dayAnchorNode = document.getElementsByClassName("weekdate")[newDayNumber] as HTMLElement;
  autoTimekeepingData.currentHighlightedDay = newDayNumber;

  setAutoTimekeepingLocalstorage(autoTimekeepingData);
  console.log(`Clicking on day ${DAYS_OF_WEEK[newDayNumber]}`);
  dayAnchorNode.click();
}

// @ts-expect-error [function provided globally]
GM_registerMenuCommand("Allow Auto Timekeeping", () => {
  const autoTimekeepingData = getDefaultAutoTimekeepingData();
  setAutoTimekeepingLocalstorage(autoTimekeepingData);
  clickOnDay(0, autoTimekeepingData);
});

setTimeout(main, 500);
