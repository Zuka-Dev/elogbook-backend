import moment from "moment";

/**
 * Get the deadline for a specific week based on enrollment date.
 * @param {Date} enrollmentDate
 * @param {number} weekNumber
 * @returns {moment.Moment} deadline moment object
 */
export const getWeekDeadline = (enrollmentDate, weekNumber) => {
  return moment(enrollmentDate)
    .add(weekNumber - 1, "weeks")
    .endOf("week")
    .hour(23)
    .minute(59)
    .second(59);
};

/**
 * Check if submission is allowed
 */
export const canSubmitWeek = (submittedWeeks, weekNumber) => {
  if (!Array.isArray(submittedWeeks) || submittedWeeks.length === 0) {
    console.log("First week submission check passed");
    return weekNumber === 1;
  } else {
    const expectedNextWeek = Math.max(...submittedWeeks) + 1;
    return weekNumber === expectedNextWeek;
  }
};
