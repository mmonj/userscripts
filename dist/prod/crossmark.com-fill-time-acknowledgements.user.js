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

  function $node(selector) {
    return document.querySelector(selector);
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

  const DROPDOWN_NODES = document.querySelectorAll('summary[data-bs-toggle="tooltip"]');
  function main() {
    const autoTimekeepingData = getAutoTimekeepingLocalstorage();
    logDayStatus(autoTimekeepingData);
    if (!isAllowAutoSubmit(autoTimekeepingData)) {
      console.warn("Not allowed to submit. Exiting.");
      return;
    }
    if ($node("#dtlsWorkingTimeCICO").innerText.endsWith("/ 0") && $node("#dtlsWorkingTimeCICO").innerText != "0 / 0") {
      console.log("Filling Working Time");
      fill_working_time();
    } else if ($node("#dtlsRestMealBreakAck").innerText.trim() == "Pending") {
      console.log("Filling Acknowledge Meal & Break");
      fill_acknowledgement_rest_meal();
    } else if ($node("#dtlsStartEndTimesAck").innerText.trim() == "Pending") {
      console.log("Filling Acknowledge Start & End Time");
      fill_acknowledgement_start_end_time();
    } else if ($node("#dtlsAttestAck").innerText.trim() == "Pending") {
      console.log("Filling Attestation");
      fill_attestation(autoTimekeepingData);
      markTimeAcknowledgementComplete(autoTimekeepingData);
      returnHome();
    } else {
      markTimeAcknowledgementComplete(autoTimekeepingData);
      returnHome();
    }
    logDayStatus(autoTimekeepingData);
  }
  function fill_working_time() {
    DROPDOWN_NODES[0].click();
    const change_event = new Event("change", { bubbles: true });
    const total_working_time_mins = parseInt(
      document.querySelector('summary[data-bs-toggle="tooltip"]').innerText
    );
    const add_time_button = document.querySelector("button#btnAddWorkingTimeCICO");
    add_time_button.click();
    const start_hours_selection_node = document.querySelector(
      '[id^="ddlStartTimeHours_WorkingTime"]'
    );
    start_hours_selection_node.value = "09 AM";
    start_hours_selection_node.dispatchEvent(change_event);
    const hours_worked = Math.floor(total_working_time_mins / 60);
    const mins_worked = total_working_time_mins % 60;
    let day_period = "AM";
    const start_hour = 9;
    let final_hours = start_hour + hours_worked;
    if (final_hours > 12) {
      final_hours -= 12;
      day_period = "PM";
    }
    if (final_hours == 12) {
      day_period = "PM";
    }
    final_hours = final_hours.toString();
    final_hours = final_hours.padStart(2, "0");
    final_hours += " " + day_period;
    let final_mins = mins_worked;
    final_mins = final_mins.toString();
    final_mins = final_mins.padStart(2, "0");
    const end_hours_selection_node = document.querySelector(
      '[id^="ddlEndTimeHours_WorkingTime"]'
    );
    end_hours_selection_node.value = final_hours;
    end_hours_selection_node.dispatchEvent(change_event);
    const end_minutes_selection_node = document.querySelector(
      '[id^="ddlEndTimeMinutes_WorkingTime"]'
    );
    end_minutes_selection_node.value = final_mins;
    end_minutes_selection_node.dispatchEvent(change_event);
    document.querySelector("#btnSaveWorkingTimeCICO").click();
  }
  function fill_acknowledgement_rest_meal() {
    DROPDOWN_NODES[2].click();
    document.querySelector("#radRestBreaksAckYes").click();
    document.querySelector("#radMealBreaksAckYes").click();
    document.querySelector("#btnSaveRestMealBreakAck").click();
  }
  function fill_acknowledgement_start_end_time() {
    DROPDOWN_NODES[3].click();
    document.querySelector("#chkTimeRecordAckCertify").click();
    document.querySelector("#chkTimeRecordAckAware").click();
    document.querySelector("#btnSaveStartEndTimesAck").click();
  }
  function fill_attestation(autoTimekeepingData) {
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
