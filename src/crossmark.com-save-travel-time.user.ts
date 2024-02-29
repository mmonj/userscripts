// ==UserScript==
// @name        crossmark.com: save travel time
// @namespace   Violentmonkey Scripts
// @match       https://retailtimesheet.crossmark.com/DTMs/*
// @grant       none
// @version     1.0
// @author      -
// @description 9/4/2022, 3:40:21 PM
// ==/UserScript==

import {
  addEventListenerForDisable,
  getAutoTimekeepingLocalstorage,
  isAllowAutoSubmit,
  isTravelTimeCompleted,
  logDayStatus,
  markTravelTimeCompleted,
} from "./util/crossmarkTimekeeping";
import { AUTO_TIMEKEEPING_DATA_TYPE } from "./util/crossmarkTimekeeping/types";
import { $node } from "./util/index";

function main(): void {
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
  }, 1000);
}

function getNumberOfVisits(): number {
  const tbodyNode = $node("#tblCalcualtedData > tbody")!;
  return tbodyNode.childElementCount - 2;
}

function clickCalculateTravelTimeBtn(): void {
  console.log("Clicked calculate time");
  $node("#CalculateDTM")!.click();
}

function updateTravelTime(): void {
  console.log("Setting custom travel time");
  const maxTimeMinutes = 59;

  const travelTimeNode = $node<HTMLInputElement>("#txtEnteredDriveTime")!;
  const calculatedTimeMinutes = Number.parseInt(travelTimeNode.value);
  let customTimeMinutes = Math.floor(calculatedTimeMinutes * 2.3);

  if (customTimeMinutes > maxTimeMinutes && calculatedTimeMinutes <= maxTimeMinutes) {
    customTimeMinutes = maxTimeMinutes;
  }

  travelTimeNode.value = customTimeMinutes.toString();
  travelTimeNode.dispatchEvent(new Event("change", { bubbles: true }));
  travelTimeNode.dispatchEvent(new Event("blur", { bubbles: true }));
}

function returnHome(): void {
  $node("#backHome")!.click();
}

function initEventListeners(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE): void {
  const travelTimeNode = $node("#txtEnteredDriveTime")!;
  const travelTimeReasonSelectNode = $node<HTMLInputElement>("#ddlReasonDriveTime")!;

  // const reasonForExtraTravelTime = "Traffic, weather, road work";

  travelTimeNode.addEventListener("blur", () => {
    // option value="135" === "Traffic, weather, road work";
    travelTimeReasonSelectNode.value = "135";
    travelTimeReasonSelectNode.dispatchEvent(new Event("change", { bubbles: true }));

    markTravelTimeCompleted(autoTimekeepingData);
    setTimeout(() => {
      pressSaveButton();
    }, 250);
  });
}

function pressSaveButton(): void {
  const saveBtn = $node("#btnSave")!;
  saveBtn.click();
}

main();
