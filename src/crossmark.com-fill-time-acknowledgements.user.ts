// ==UserScript==
// @name        crossmark.com: fill time acknowledgements
// @namespace   Violentmonkey Scripts
// @match       https://retailtimesheet.crossmark.com/StartEndTimeAndAcks/StartEndTimeAndAcks
// @grant       none
// @version     1.0
// @author      -
// @description 7/24/2022, 10:46:03 PM
// ==/UserScript==

import { $node } from "./util";
import {
  addEventListenerForDisable,
  getAutoTimekeepingLocalstorage,
  isAllowAutoSubmit,
  logDayStatus,
  setAutoTimekeepingLocalstorage,
} from "./util/crossmarkTimekeeping";
import { AUTO_TIMEKEEPING_DATA_TYPE } from "./util/crossmarkTimekeeping/types";

const DROPDOWN_NODES = document.querySelectorAll<HTMLElement>("summary[data-bs-toggle='tooltip']");

function main(): void {
  const autoTimekeepingData = getAutoTimekeepingLocalstorage();
  logDayStatus(autoTimekeepingData);
  addEventListenerForDisable(autoTimekeepingData);

  if (!isAllowAutoSubmit(autoTimekeepingData)) {
    console.warn("Not allowed to submit. Exiting.");
    return;
  }

  if (
    $node("#dtlsWorkingTimeCICO")!.innerText.endsWith("/ 0") &&
    $node("#dtlsWorkingTimeCICO")!.innerText != "0 / 0"
  ) {
    console.log("Filling Working Time");
    fillWorkingTime();
  } else if ($node("#dtlsRestMealBreakAck")!.innerText.trim() == "Pending") {
    console.log("Filling Acknowledge Meal & Break");
    fillAcknowledgementRestMeal();
  } else if ($node("#dtlsStartEndTimesAck")!.innerText.trim() == "Pending") {
    console.log("Filling Acknowledge Start & End Time");
    fillAcknowledgementStartEndTime();
  } else if ($node("#dtlsAttestAck")!.innerText.trim() == "Pending") {
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

function fillWorkingTime(): void {
  DROPDOWN_NODES[0].click();
  const changeEvent = new Event("change", { bubbles: true });

  const workWorkTimeMinutes = Number.parseInt(
    document.querySelector<HTMLElement>("summary[data-bs-toggle='tooltip']")!.innerText
  );

  const addTimeButton = document.querySelector<HTMLElement>("button#btnAddWorkingTimeCICO")!;
  addTimeButton.click();

  const startHoursSelectNode = document.querySelector<HTMLInputElement>(
    "[id^='ddlStartTimeHours_WorkingTime']"
  )!;
  startHoursSelectNode.value = "09 AM";
  startHoursSelectNode.dispatchEvent(changeEvent);

  const hoursWorked = Math.floor(workWorkTimeMinutes / 60);
  const MinsWorked = workWorkTimeMinutes % 60;
  let dayPeriod = "AM";
  const startHour = 9;
  let finalHours: string | number = startHour + hoursWorked;
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

  let finalMins: string | number = MinsWorked;
  finalMins = finalMins.toString();
  finalMins = finalMins.padStart(2, "0");

  const endHoursSelectNode = document.querySelector<HTMLInputElement>(
    "[id^='ddlEndTimeHours_WorkingTime']"
  )!;
  endHoursSelectNode.value = finalHours;
  endHoursSelectNode.dispatchEvent(changeEvent);

  const endMinutesSelectNode = document.querySelector<HTMLInputElement>(
    "[id^='ddlEndTimeMinutes_WorkingTime']"
  )!;
  endMinutesSelectNode.value = finalMins;
  endMinutesSelectNode.dispatchEvent(changeEvent);
  document.querySelector<HTMLElement>("#btnSaveWorkingTimeCICO")!.click();
}

function fillAcknowledgementRestMeal(): void {
  DROPDOWN_NODES[2].click();
  document.querySelector<HTMLElement>("#radRestBreaksAckYes")!.click();
  document.querySelector<HTMLElement>("#radMealBreaksAckYes")!.click();
  document.querySelector<HTMLElement>("#btnSaveRestMealBreakAck")!.click();
}

function fillAcknowledgementStartEndTime(): void {
  DROPDOWN_NODES[3].click();
  document.querySelector<HTMLElement>("#chkTimeRecordAckCertify")!.click();
  document.querySelector<HTMLElement>("#chkTimeRecordAckAware")!.click();
  document.querySelector<HTMLElement>("#btnSaveStartEndTimesAck")!.click();
}

function fillAttestation(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE): void {
  if ($node("#dtlsWorkingTimeCICO")!.innerText === "0 / 0") {
    markTimeAcknowledgementComplete(autoTimekeepingData);
  }
  DROPDOWN_NODES[4].click();
  document.querySelector<HTMLElement>("#chkTimeRecordAckAttest")!.click();
  document.querySelector<HTMLElement>("#btnSaveAttestAck")!.click();
}

function returnHome(): void {
  console.log("All Completed!\n\n");
  setTimeout(() => {
    $node("#backHome")!.click();
  }, 250);
}

function markTimeAcknowledgementComplete(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE): void {
  const dayNumber = autoTimekeepingData.currentHighlightedDay;
  autoTimekeepingData.daysOfTheWeek[dayNumber].isTimeAcknowledgementCompleted = true;
  setAutoTimekeepingLocalstorage(autoTimekeepingData);
}

setTimeout(main, 250);
