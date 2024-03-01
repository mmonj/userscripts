// ==UserScript==
// @name        cunyfirst: schedule-builder-add-room-number
// @namespace   Violentmonkey Scripts
// @match       https://sb.cunyfirst.cuny.edu/criteria.jsp*
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description 2/29/2024, 5:22:38 PM
// ==/UserScript==

type TCourseInfo = {
  courseTitle: string;
  courseLocation: string;
};

const ROOM_REGEX = /(\w+ *- *\w+) *$/i;
const LOCATION_CLASS_NAME = "mm-location";

function addCourseRoomsToSchedule(): void {
  const courseLocations: TCourseInfo[] = [];

  document.querySelectorAll(".course_box").forEach((courseElement) => {
    const courseTitleElm = courseElement.querySelector<HTMLElement>(".course_title")!;
    const locationElement = courseElement.querySelector<HTMLElement>(".location_block");
    if (locationElement === null) {
      console.warn("Location element not found for", courseTitleElm.innerText);
      return;
    }

    courseLocations.push(getCourseLocationInfo(courseTitleElm.innerText, locationElement));
  });

  addToScheduleGrid(courseLocations);
}

function getCourseLocationInfo(courseName: string, locationElement: HTMLElement): TCourseInfo {
  let courseLocation = locationElement.innerText.trim();
  let match = ROOM_REGEX.exec(courseLocation);
  if (match) courseLocation = match[1];

  const partialLocationElements =
    locationElement.querySelectorAll<HTMLElement>(".legend_multi_loc");

  if (partialLocationElements.length === 0) {
    return {
      courseTitle: courseName,
      courseLocation: courseLocation.replace(" Rm ", " "),
    };
  }

  courseLocation = [...partialLocationElements].at(-1)!.innerText.replace(" Rm ", " ");
  match = ROOM_REGEX.exec(courseLocation);
  if (match) courseLocation = match[1];

  return {
    courseTitle: courseName,
    courseLocation: courseLocation,
  };
}

function addToScheduleGrid(courseInfolist: TCourseInfo[]): void {
  const timeBlocks = document.querySelectorAll<HTMLElement>(".weekTimes > .time_block");
  if (timeBlocks.length === 0) {
    console.warn("No time blocks are currently visible in view");
    alert("No time blocks are currently visible in view");
  }

  timeBlocks.forEach((timeBlock) => {
    if (timeBlock.getElementsByClassName(LOCATION_CLASS_NAME).length > 0) {
      console.warn("This timeblock has already had a location added:", timeBlock);
      return;
    }

    const currentCourseInfoNode = timeBlock.querySelector<HTMLElement>(".nonmobile");
    if (currentCourseInfoNode === null) {
      console.warn("Course info element not found for", timeBlock);
      return;
    }

    const currentCourseName = currentCourseInfoNode.innerText.split("\n")[0];
    const courseInfo = courseInfolist.find(
      (courseInfo) => courseInfo.courseTitle === currentCourseName
    );
    if (courseInfo === undefined) {
      console.warn(`Course name "${currentCourseName}" not found in CourseInfolist`);
      return;
    }

    if (courseInfo.courseLocation === "Online") return;

    const newSpan = document.createElement("span");
    newSpan.setAttribute("style", "display: block;");
    newSpan.innerText = courseInfo.courseLocation;
    newSpan.classList.add(LOCATION_CLASS_NAME);

    currentCourseInfoNode.append(newSpan);
  });
}

window.GM_registerMenuCommand("add-course-rooms", addCourseRoomsToSchedule);
