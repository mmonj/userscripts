export type DAY_OF_WEEK_TYPE = {
  name: string;
  isTravelTimeCompleted: boolean;
  isTimeAcknowledgementCompleted: boolean;
};
export type AUTO_TIMEKEEPING_DATA_TYPE = {
  currentHighlightedDay: number;
  daysOfTheWeek: DAY_OF_WEEK_TYPE[];
};
