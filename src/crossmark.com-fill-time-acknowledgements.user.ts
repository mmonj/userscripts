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

const DROPDOWN_NODES = document.querySelectorAll<HTMLElement>('summary[data-bs-toggle="tooltip"]');

function main() {
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
    fill_working_time();
  } else if ($node("#dtlsRestMealBreakAck")!.innerText.trim() == "Pending") {
    console.log("Filling Acknowledge Meal & Break");
    fill_acknowledgement_rest_meal();
  } else if ($node("#dtlsStartEndTimesAck")!.innerText.trim() == "Pending") {
    console.log("Filling Acknowledge Start & End Time");
    fill_acknowledgement_start_end_time();
  } else if ($node("#dtlsAttestAck")!.innerText.trim() == "Pending") {
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
    document.querySelector<HTMLElement>('summary[data-bs-toggle="tooltip"]')!.innerText
  );

  const add_time_button = document.querySelector<HTMLElement>("button#btnAddWorkingTimeCICO")!;
  add_time_button.click();

  const start_hours_selection_node = document.querySelector<HTMLInputElement>(
    '[id^="ddlStartTimeHours_WorkingTime"]'
  )!;
  start_hours_selection_node.value = "09 AM";
  start_hours_selection_node.dispatchEvent(change_event);

  const hours_worked = Math.floor(total_working_time_mins / 60);
  const mins_worked = total_working_time_mins % 60;
  let day_period = "AM";
  const start_hour = 9;
  let final_hours: string | number = start_hour + hours_worked;
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

  let final_mins: string | number = mins_worked;
  final_mins = final_mins.toString();
  final_mins = final_mins.padStart(2, "0");

  const end_hours_selection_node = document.querySelector<HTMLInputElement>(
    '[id^="ddlEndTimeHours_WorkingTime"]'
  )!;
  end_hours_selection_node.value = final_hours;
  end_hours_selection_node.dispatchEvent(change_event);

  const end_minutes_selection_node = document.querySelector<HTMLInputElement>(
    '[id^="ddlEndTimeMinutes_WorkingTime"]'
  )!;
  end_minutes_selection_node.value = final_mins;
  end_minutes_selection_node.dispatchEvent(change_event);
  document.querySelector<HTMLElement>("#btnSaveWorkingTimeCICO")!.click();
}

function fill_acknowledgement_rest_meal() {
  DROPDOWN_NODES[2].click();
  document.querySelector<HTMLElement>("#radRestBreaksAckYes")!.click();
  document.querySelector<HTMLElement>("#radMealBreaksAckYes")!.click();
  document.querySelector<HTMLElement>("#btnSaveRestMealBreakAck")!.click();
}

function fill_acknowledgement_start_end_time() {
  DROPDOWN_NODES[3].click();
  document.querySelector<HTMLElement>("#chkTimeRecordAckCertify")!.click();
  document.querySelector<HTMLElement>("#chkTimeRecordAckAware")!.click();
  document.querySelector<HTMLElement>("#btnSaveStartEndTimesAck")!.click();
}

function fill_attestation(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  if ($node("#dtlsWorkingTimeCICO")!.innerText === "0 / 0") {
    markTimeAcknowledgementComplete(autoTimekeepingData);
  }
  DROPDOWN_NODES[4].click();
  document.querySelector<HTMLElement>("#chkTimeRecordAckAttest")!.click();
  document.querySelector<HTMLElement>("#btnSaveAttestAck")!.click();
}

function returnHome() {
  console.log("All Completed!\n\n");
  setTimeout(() => {
    $node("#backHome")!.click();
  }, 250);
}

function markTimeAcknowledgementComplete(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  const dayNumber = autoTimekeepingData.currentHighlightedDay;
  autoTimekeepingData.daysOfTheWeek[dayNumber].isTimeAcknowledgementCompleted = true;
  setAutoTimekeepingLocalstorage(autoTimekeepingData);
}

setTimeout(main, 250);
