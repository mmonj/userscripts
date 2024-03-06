// ==UserScript==
// @name        cunyfirst: schedule-builder-add-room-number
// @namespace   Violentmonkey Scripts
// @match       https://sb.cunyfirst.cuny.edu/criteria.jsp*
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description add room number to Cunyfirst Schedule Builder's grid schedule view for a more convenient screenshot
// ==/UserScript==

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const SHORT_DAY_NAMES = ["Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"];
  const ANIMATION_CSS_VALUE = " animation: pulse 600ms cubic-bezier(0,0,.2,1) forwards;";
  const ROOM_REGEX = /(\w+ *- *\w+) *$/i;
  const LOCATION_CLASS_NAME = "mm-location";
  function main() {
    const courseLocations = [];
    document.querySelectorAll(".course_box").forEach((courseElement) => {
      const courseTitleElm = courseElement.querySelector(".course_title");
      const locationElement = courseElement.querySelector(".location_block");
      if (locationElement === null) {
        console.warn("Location element not found for", courseTitleElm.innerText);
        return;
      }
      courseLocations.push(getCourseLocationInfo(courseTitleElm.innerText, locationElement));
    });
    const timeBlocks = document.querySelectorAll(".weekTimes > .time_block");
    if (timeBlocks.length === 0) {
      console.warn("No time blocks are currently visible in view");
      alert("No time blocks are currently visible in view");
      return;
    }
    timeBlocks.forEach((timeBlock) => addToScheduleGrid(timeBlock, courseLocations));
  }
  function getCourseLocationInfo(courseName, locationElement) {
    const partialLocationElements = locationElement.querySelectorAll(".legend_multi_loc");
    if (partialLocationElements.length === 0) {
      let courseLocation = locationElement.innerText.trim();
      const match = ROOM_REGEX.exec(courseLocation);
      if (match)
        courseLocation = match[1];
      return {
        courseTitle: courseName,
        courseLocationData: {
          single: true,
          location: courseLocation
        }
      };
    }
    const locationInfo = [];
    locationElement.innerText.split("\n").forEach((line, idx) => {
      line = line.trim();
      if (line.length === 0)
        return;
      let location = partialLocationElements[idx].innerText.trim();
      const scheduledTime = line.replace(location, "");
      const scheduledDay = findScheduledDay(scheduledTime);
      if (scheduledDay === null)
        throw new Error(`Could not find day for ${scheduledTime}`);
      const match = ROOM_REGEX.exec(location);
      if (match)
        location = match[1];
      locationInfo.push({
        day: scheduledDay,
        roomInfo: location
      });
    });
    return {
      courseTitle: courseName,
      courseLocationData: {
        single: false,
        location: locationInfo
      }
    };
  }
  function findScheduledDay(scheduledTime) {
    for (const shortDay of SHORT_DAY_NAMES) {
      const startString = `${shortDay} :`;
      if (scheduledTime.startsWith(startString)) {
        return shortDay;
      }
    }
    return null;
  }
  function addToScheduleGrid(timeBlock, courseInfolist) {
    const existingLocationNode = timeBlock.querySelector("." + LOCATION_CLASS_NAME);
    if (existingLocationNode) {
      console.warn("This timeblock has already had a location added:", existingLocationNode);
      const truncatedStyle = existingLocationNode.getAttribute("style").replace(ANIMATION_CSS_VALUE, "");
      existingLocationNode.setAttribute("style", truncatedStyle);
      setTimeout(() => {
        existingLocationNode.setAttribute("style", truncatedStyle + ANIMATION_CSS_VALUE);
      }, 50);
      return;
    }
    const currentCourseInfoNode = timeBlock.querySelector(".nonmobile");
    if (currentCourseInfoNode === null) {
      console.warn("Course info element not found for", timeBlock);
      return;
    }
    const currentCourseName = currentCourseInfoNode.innerText.split("\n")[0];
    const courseInfo = courseInfolist.find(
      (courseInfo2) => courseInfo2.courseTitle === currentCourseName
    );
    if (courseInfo === void 0) {
      console.warn(`Course name "${currentCourseName}" not found in CourseInfolist`);
      return;
    }
    if (courseInfo.courseLocationData.single === true) {
      const newSpan2 = getNewLocationSpan(courseInfo.courseLocationData.location);
      currentCourseInfoNode.append(newSpan2);
      return;
    }
    const shortDay = getDayFromTimeblock(timeBlock);
    const locationInfo = courseInfo.courseLocationData.location.find(
      (location) => location.day === shortDay
    );
    const newSpan = getNewLocationSpan(locationInfo.roomInfo);
    currentCourseInfoNode.append(newSpan);
  }
  function getNewLocationSpan(roomNumber) {
    const newSpan = document.createElement("span");
    newSpan.setAttribute("style", `display: block; ${ANIMATION_CSS_VALUE}`);
    newSpan.innerText = roomNumber;
    newSpan.classList.add(LOCATION_CLASS_NAME);
    return newSpan;
  }
  function getDayFromTimeblock(timeBlock) {
    const maxPixelOffset = 2;
    const targetXCoordinate = timeBlock.getBoundingClientRect().x;
    const dayHeaderNodes = document.querySelector(".weekArea .header").children;
    for (const dayNode of dayHeaderNodes) {
      if (Math.abs(dayNode.getBoundingClientRect().x - targetXCoordinate) < maxPixelOffset) {
        const shortDay = dayNode.innerText.split("\n")[0];
        return shortDay;
      }
    }
    return null;
  }
  window.GM_registerMenuCommand("add-course-rooms", main);

}));
