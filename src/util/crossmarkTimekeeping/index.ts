import { $byText } from "..";
import { AUTO_TIMEKEEPING_DATA_TYPE, DAY_OF_WEEK_TYPE } from "./types";

export const LOCALSTORAGE_KEY = "AutoTimekeeping";
export const DAYS_OF_WEEK: DAY_OF_WEEK_TYPE[] = [
  { name: "Sunday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
  { name: "Monday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
  { name: "Tuesday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
  { name: "Wednesday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
  { name: "Thursday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
  { name: "Friday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
  { name: "Saturday", isTravelTimeCompleted: false, isTimeAcknowledgementCompleted: false },
];

export function getAutoTimekeepingLocalstorage(): AUTO_TIMEKEEPING_DATA_TYPE {
  const dataString = localStorage.getItem(LOCALSTORAGE_KEY);
  let data = getDefaultAutoTimekeepingData();

  if (dataString === null) {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
  } else {
    data = JSON.parse(dataString);
  }

  return data;
}

export function setAutoTimekeepingLocalstorage(data: AUTO_TIMEKEEPING_DATA_TYPE) {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
}

export function getDefaultAutoTimekeepingData(): AUTO_TIMEKEEPING_DATA_TYPE {
  return {
    currentHighlightedDay: -1,
    daysOfTheWeek: structuredClone(DAYS_OF_WEEK),
    enabled: true,
  };
}

export function markTravelTimeCompleted(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  const dayNumber = autoTimekeepingData.currentHighlightedDay;
  autoTimekeepingData.daysOfTheWeek[dayNumber].isTravelTimeCompleted = true;
  setAutoTimekeepingLocalstorage(autoTimekeepingData);
}

export function logDayStatus(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  const day = autoTimekeepingData.daysOfTheWeek[autoTimekeepingData.currentHighlightedDay];
  console.log(`Day (${autoTimekeepingData.currentHighlightedDay}) status:`);
  if (autoTimekeepingData.currentHighlightedDay === -1) {
    console.log("Undefined Day data for day -1");
    return;
  }
  console.log(day);
}

export function isAllowAutoSubmit(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  return autoTimekeepingData.enabled;
}

export function isTravelTimeCompleted(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  // const travelInfo = ($node("a[href='/DTMs/DTM']")!.parentElement!.nextElementSibling! as HTMLElement).innerText;
  const dayWorkTimeInfoNode = $byText<HTMLElement>("div[class^='col']", "Working Time")
    ?.nextElementSibling as HTMLElement | null;

  if ((dayWorkTimeInfoNode?.innerText ?? "") === "0 minutes") {
    markTravelTimeCompleted(autoTimekeepingData);
    return true;
  }

  return autoTimekeepingData.daysOfTheWeek[autoTimekeepingData.currentHighlightedDay]
    .isTravelTimeCompleted;
}

export function isTimeAcknowledgementCompleted(autoTimekeepingData: AUTO_TIMEKEEPING_DATA_TYPE) {
  return autoTimekeepingData.daysOfTheWeek[autoTimekeepingData.currentHighlightedDay]
    .isTimeAcknowledgementCompleted;
}
