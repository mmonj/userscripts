// ==UserScript==
// @name        crossmark.com: fill time acknowledgements
// @namespace   Violentmonkey Scripts
// @match       https://retailtimesheet.crossmark.com/StartEndTimeAndAcks/StartEndTimeAndAcks
// @grant       none
// @version     1.0
// @author      -
// @description 7/24/2022, 10:46:03 PM
// ==/UserScript==

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const $node = document.querySelector;

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
  function addEventListenerForDisable(autoTimekeepingData) {
    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        autoTimekeepingData.enabled = false;
        setAutoTimekeepingLocalstorage(autoTimekeepingData);
      }
    });
  }

  const DROPDOWN_NODES = document.querySelectorAll("summary[data-bs-toggle='tooltip']");
  function main() {
    const autoTimekeepingData = getAutoTimekeepingLocalstorage();
    logDayStatus(autoTimekeepingData);
    addEventListenerForDisable(autoTimekeepingData);
    if (!isAllowAutoSubmit(autoTimekeepingData)) {
      console.warn("Not allowed to submit. Exiting.");
      return;
    }
    if ($node("#dtlsWorkingTimeCICO").innerText.endsWith("/ 0") && $node("#dtlsWorkingTimeCICO").innerText != "0 / 0") {
      console.log("Filling Working Time");
      fillWorkingTime();
    } else if ($node("#dtlsRestMealBreakAck").innerText.trim() == "Pending") {
      console.log("Filling Acknowledge Meal & Break");
      fillAcknowledgementRestMeal();
    } else if ($node("#dtlsStartEndTimesAck").innerText.trim() == "Pending") {
      console.log("Filling Acknowledge Start & End Time");
      fillAcknowledgementStartEndTime();
    } else if ($node("#dtlsAttestAck").innerText.trim() == "Pending") {
      console.log("Filling Attestation");
      fillAttestation(autoTimekeepingData);
      markTimeAcknowledgementComplete(autoTimekeepingData);
      returnHome();
    } else {
      markTimeAcknowledgementComplete(autoTimekeepingData);
      returnHome();
    }
    logDayStatus(autoTimekeepingData);
  }
  function fillWorkingTime() {
    DROPDOWN_NODES[0].click();
    const changeEvent = new Event("change", { bubbles: true });
    const workWorkTimeMinutes = Number.parseInt(
      document.querySelector("summary[data-bs-toggle='tooltip']").innerText
    );
    const addTimeButton = document.querySelector("button#btnAddWorkingTimeCICO");
    addTimeButton.click();
    const startHoursSelectNode = document.querySelector(
      "[id^='ddlStartTimeHours_WorkingTime']"
    );
    startHoursSelectNode.value = "09 AM";
    startHoursSelectNode.dispatchEvent(changeEvent);
    const hoursWorked = Math.floor(workWorkTimeMinutes / 60);
    const MinsWorked = workWorkTimeMinutes % 60;
    let dayPeriod = "AM";
    const startHour = 9;
    let finalHours = startHour + hoursWorked;
    if (finalHours > 12) {
      finalHours -= 12;
      dayPeriod = "PM";
    }
    if (finalHours == 12) {
      dayPeriod = "PM";
    }
    finalHours = finalHours.toString();
    finalHours = finalHours.padStart(2, "0");
    finalHours += " " + dayPeriod;
    let finalMins = MinsWorked;
    finalMins = finalMins.toString();
    finalMins = finalMins.padStart(2, "0");
    const endHoursSelectNode = document.querySelector(
      "[id^='ddlEndTimeHours_WorkingTime']"
    );
    endHoursSelectNode.value = finalHours;
    endHoursSelectNode.dispatchEvent(changeEvent);
    const endMinutesSelectNode = document.querySelector(
      "[id^='ddlEndTimeMinutes_WorkingTime']"
    );
    endMinutesSelectNode.value = finalMins;
    endMinutesSelectNode.dispatchEvent(changeEvent);
    document.querySelector("#btnSaveWorkingTimeCICO").click();
  }
  function fillAcknowledgementRestMeal() {
    DROPDOWN_NODES[2].click();
    document.querySelector("#radRestBreaksAckYes").click();
    document.querySelector("#radMealBreaksAckYes").click();
    document.querySelector("#btnSaveRestMealBreakAck").click();
  }
  function fillAcknowledgementStartEndTime() {
    DROPDOWN_NODES[3].click();
    document.querySelector("#chkTimeRecordAckCertify").click();
    document.querySelector("#chkTimeRecordAckAware").click();
    document.querySelector("#btnSaveStartEndTimesAck").click();
  }
  function fillAttestation(autoTimekeepingData) {
    if ($node("#dtlsWorkingTimeCICO").innerText === "0 / 0") {
      markTimeAcknowledgementComplete(autoTimekeepingData);
    }
    DROPDOWN_NODES[4].click();
    document.querySelector("#chkTimeRecordAckAttest").click();
    document.querySelector("#btnSaveAttestAck").click();
  }
  function returnHome() {
    console.log("All Completed!\n\n");
    setTimeout(() => {
      $node("#backHome").click();
    }, 250);
  }
  function markTimeAcknowledgementComplete(autoTimekeepingData) {
    const dayNumber = autoTimekeepingData.currentHighlightedDay;
    autoTimekeepingData.daysOfTheWeek[dayNumber].isTimeAcknowledgementCompleted = true;
    setAutoTimekeepingLocalstorage(autoTimekeepingData);
  }
  setTimeout(main, 250);

}));
