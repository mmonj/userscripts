// ==UserScript==
// @name        crossmark.com: save travel time
// @namespace   Violentmonkey Scripts
// @match       https://retailtimesheet.crossmark.com/DTMs/*
// @grant       none
// @version     1.0
// @author      -
// @description 9/4/2022, 3:40:21 PM
// ==/UserScript==

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const $node = document.querySelector;
  function $nodeByText(selector, innerText) {
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
    const dayWorkTimeInfoNode = $nodeByText("div[class^='col']", "Working Time")?.nextElementSibling;
    if ((dayWorkTimeInfoNode?.innerText ?? "") === "0 minutes") {
      markTravelTimeCompleted(autoTimekeepingData);
      return true;
    }
    return autoTimekeepingData.daysOfTheWeek[autoTimekeepingData.currentHighlightedDay].isTravelTimeCompleted;
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
      console.warn("Not allowed to auto submit. Exiting");
      return;
    }
    if (isTravelTimeCompleted(autoTimekeepingData)) {
      console.warn("Travel time is completed. Navigating back");
      returnHome();
      return;
    }
    const numberOfVisits = getNumberOfVisits();
    if (numberOfVisits < 2) {
      markTravelTimeCompleted(autoTimekeepingData);
      returnHome();
      console.log("Number of visits less than 2");
      return;
    }
    initEventListeners(autoTimekeepingData);
    clickCalculateTravelTimeBtn();
    setTimeout(() => {
      updateTravelTime();
      logDayStatus(autoTimekeepingData);
    }, 1e3);
  }
  function getNumberOfVisits() {
    const tbodyNode = $node("#tblCalcualtedData > tbody");
    return tbodyNode.childElementCount - 2;
  }
  function clickCalculateTravelTimeBtn() {
    console.log("Clicked calculate time");
    $node("#CalculateDTM").click();
  }
  function updateTravelTime() {
    console.log("Setting custom travel time");
    const maxTimeMinutes = 59;
    const travelTimeNode = $node("#txtEnteredDriveTime");
    const calculatedTimeMinutes = Number.parseInt(travelTimeNode.value);
    let customTimeMinutes = Math.floor(calculatedTimeMinutes * 2.3);
    if (customTimeMinutes > maxTimeMinutes && calculatedTimeMinutes <= maxTimeMinutes) {
      customTimeMinutes = maxTimeMinutes;
    }
    travelTimeNode.value = customTimeMinutes.toString();
    travelTimeNode.dispatchEvent(new Event("change", { bubbles: true }));
    travelTimeNode.dispatchEvent(new Event("blur", { bubbles: true }));
  }
  function returnHome() {
    $node("#backHome").click();
  }
  function initEventListeners(autoTimekeepingData) {
    const travelTimeNode = $node("#txtEnteredDriveTime");
    const travelTimeReasonSelectNode = $node("#ddlReasonDriveTime");
    travelTimeNode.addEventListener("blur", () => {
      travelTimeReasonSelectNode.value = "135";
      travelTimeReasonSelectNode.dispatchEvent(new Event("change", { bubbles: true }));
      markTravelTimeCompleted(autoTimekeepingData);
      setTimeout(() => {
        pressSaveButton();
      }, 250);
    });
  }
  function pressSaveButton() {
    const saveBtn = $node("#btnSave");
    saveBtn.click();
  }
  main();

}));
