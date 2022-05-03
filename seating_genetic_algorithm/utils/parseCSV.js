const Papa = require("papaparse");

const parseCSV = (studentFile, courseFile, roomFile) => {
  const studentDetails = Papa.parse(studentFile.toString());
  const courseDetails = Papa.parse(courseFile.toString());
  const roomDetails = Papa.parse(roomFile.toString());
  return {
    studentDetails: studentDetails.data,
    courseDetails: courseDetails.data,
    roomDetails: roomDetails.data
  }
}

module.exports = parseCSV;