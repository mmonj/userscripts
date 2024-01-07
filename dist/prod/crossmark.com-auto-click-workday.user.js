// ==UserScript==
// @name        crossmark.com - auto-click on workday
// @namespace   Violentmonkey Scripts
// @match       https://retailtimesheet.crossmark.com/
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description 1/1/2024, 3:16:42 PM
// ==/UserScript==

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  function $byText(selector, innerText) {
    const nodes = document.querySelectorAll(selector);
    for (const node of nodes) {
      if (node.innerText === innerText) {
        return node;
      }
    }
    return null;
  }

  const LOCALSTORAGE_KEY = "AutoTimekeeping";
  const DAYS_OF_WEEK = [
    { name: "Sunday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
    { name: "Monday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
    { name: "Tuesday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
    { name: "Wednesday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
    { name: "Thursday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
    { name: "Friday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
    { name: "Saturday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false }
  ];
  function getAutoTimekeepingLocalstorage() {
    const dataString = localStorage.getItem(LOCALSTORAGE_KEY);
    let data = getDefaultAutoTimekeepingData();
    if (dataString === null) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    } else {
      data = JSON.parse(dataString);
    }
    return data;
  }
  function setAutoTimekeepingLocalstorage(data) {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
  }
  function getDefaultAutoTimekeepingData() {
    return {
      currentHighlightedDay: -1,
      daysOfTheWeek: structuredClone(DAYS_OF_WEEK),
      enabled: true
    };
  }
  function markTravelTimeCompleted(autoTimekeepingData) {
    const dayNumber = autoTimekeepingData.currentHighlightedDay;
    autoTimekeepingData.daysOfTheWeek[dayNumber].isTravelTimeCompleted = true;
    setAutoTimekeepingLocalstorage(autoTimekeepingData);
  }
  function logDayStatus(autoTimekeepingData) {
    const day = autoTimekeepingData.daysOfTheWeek[autoTimekeepingData.currentHighlightedDay];
    console.log(`Day (${autoTimekeepingData.currentHighlightedDay}) status:`);
    if (autoTimekeepingData.currentHighlightedDay === -1) {
      console.log("Undefined Day data for day -1");
      return;
    }
    console.log(day);
  }
  function isAllowAutoSubmit(autoTimekeepingData) {
    return autoTimekeepingData.enabled;
  }
  function isTravelTimeCompleted(autoTimekeepingData) {
    const dayWorkTimeInfoNode = $byText("div[class^='col']", "Working Time")?.nextElementSibling;
    if ((dayWorkTimeInfoNode?.innerText ?? "") === "0 minutes") {
      markTravelTimeCompleted(autoTimekeepingData);
      return true;
    }
    return autoTimekeepingData.daysOfTheWeek[autoTimekeepingData.currentHighlightedDay].isTravelTimeCompleted;
  }
  function isTimeAcknowledgementCompleted(autoTimekeepingData) {
    return autoTimekeepingData.daysOfTheWeek[autoTimekeepingData.currentHighlightedDay].isTimeAcknowledgementCompleted;
  }
  function addEventListenerForDisable(autoTimekeepingData) {
    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        autoTimekeepingData.enabled = false;
        setAutoTimekeepingLocalstorage(autoTimekeepingData);
      }
    });
  }

  function main() {
    const autoTimekeepingData = getAutoTimekeepingLocalstorage();
    logDayStatus(autoTimekeepingData);
    addEventListenerForDisable(autoTimekeepingData);
    if (!isAllowAutoSubmit(autoTimekeepingData)) {
      console.warn(`Not allowed to auto submit. Exiting`);
      return;
    }
    if (isTravelTimeCompleted(autoTimekeepingData) && isTimeAcknowledgementCompleted(autoTimekeepingData)) {
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
    document.querySelector("a[href='/DTMs/DTM']").click();
  }
  function clickTimeAcknowledgement() {
    document.querySelector("a[href='/StartEndTimeAndAcks/StartEndTimeAndAcks']").click();
  }
  function clickOnDay(newDayNumber, autoTimekeepingData) {
    if (newDayNumber > 6) {
      console.warn("No day past 6 available. Returning.");
      autoTimekeepingData.enabled = false;
      setAutoTimekeepingLocalstorage(autoTimekeepingData);
      return;
    }
    const dayAnchorNode = document.getElementsByClassName("weekdate")[newDayNumber];
    autoTimekeepingData.currentHighlightedDay = newDayNumber;
    setAutoTimekeepingLocalstorage(autoTimekeepingData);
    console.log(`Clicking on day ${DAYS_OF_WEEK[newDayNumber]}`);
    dayAnchorNode.click();
  }
  GM_registerMenuCommand("Allow Auto Timekeeping", () => {
    const autoTimekeepingData = getDefaultAutoTimekeepingData();
    setAutoTimekeepingLocalstorage(autoTimekeepingData);
    clickOnDay(0, autoTimekeepingData);
  });
  setTimeout(main, 500);

}));
