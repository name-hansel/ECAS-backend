const puppeteer = require('puppeteer')
const ejs = require("ejs");
const path = require("path");
const { parseJSON, parseISO, format } = require("date-fns");

function getTemplate(subjectDetails) {
  // Template
  const roomSubjectStudents = {};
  for (let i = 1; i < subjectDetails[0].length; i++)
    roomSubjectStudents[subjectDetails[0][i]] = [];
  return roomSubjectStudents
}

function getSolutionMatrix(data, ROWS, COLUMNS) {
  data = data.map(d => d[3] ? d[3][1] : 'EMPTY');

  // Convert to left array
  let inLeftArray = 0;
  const leftArray = [];
  for (let i = 0; i < ROWS; i++) {
    leftArray[i] = [];
    for (let j = 0; j < COLUMNS; j++)
      leftArray[i].push(data[inLeftArray++]);
  }

  const topArray = leftArray[0].map((val, index) => leftArray.map(row => row[index]).reverse())

  return topArray;
}

const getPDF = async (data, studentDetails, roomDetails, subjectDetails, title, dateOfExam) => {
  for (let i = 0; i < data.length; i++) {
    // Empty seat
    if (data[i][3].length === 0) {
      data[i][3] = null
      continue
    };
    const subject = data[i][3][1];
    data[i][3] = subject;
  }

  // Assign seats roll no. wise for each subject

  // Create object of arrays for storing students
  const subjectStudents = {};
  for (let i = 1; i < subjectDetails[0].length; i++)
    subjectStudents[subjectDetails[0][i]] = [];

  // Add students to respective arrays
  // Add in reverse order, so we can pop while assigning seats
  for (let i = studentDetails.length - 1; i >= 0; i--)
    subjectStudents[studentDetails[i][1]].push(studentDetails[i][0])

  for (let i = 0; i < data.length; i++) {
    if (!data[i][3]) continue
    let subject = data[i][3];
    let student = subjectStudents[subject].pop();
    data[i][3] = [subject, student];
  }

  // Get arrangements room-wise
  const rooms = [];
  for (let i = 0; i < roomDetails.length; i++) {
    rooms[i] = {
      name: roomDetails[i][2],
      seats: [],
      subjectDetails: {},
      rows: roomDetails[i][0],
      columns: roomDetails[i][1]
    };

    for (let j = 1; j < subjectDetails[0].length; j++)
      rooms[i]['subjectDetails'][subjectDetails[0][j]] = [];
  }


  for (let i = 0; i < data.length; i++) {
    rooms[Number(data[i][0])].seats.push(data[i])
  }

  // Go room by room and get first and last roll numbers for each subject
  for (room of rooms) {
    // Create object containing subject name and array containing all students
    const currentRoomSubjectStudents = getTemplate(subjectDetails);
    for (seat of room.seats) {
      if (!seat[3]) continue;
      currentRoomSubjectStudents[seat[3][0]].push(seat[3][1])
    }

    // Add first and last roll numbers of each subject to room.subjectDetails
    for (subject in currentRoomSubjectStudents) {
      // Check if only one student
      if (currentRoomSubjectStudents[subject].length === 1) {
        room.subjectDetails[subject].push(currentRoomSubjectStudents[subject][0]);
        continue;
      }

      // First student
      room.subjectDetails[subject].push(currentRoomSubjectStudents[subject][0]);
      // Last student
      room.subjectDetails[subject].push(currentRoomSubjectStudents[subject][currentRoomSubjectStudents[subject].length - 1]);
    }
  }

  // Get subject wise
  const subjectRoom = getTemplate(subjectDetails);
  for (let i = 0; i < rooms.length; i++) {
    let room = rooms[i];
    for (subject in room.subjectDetails) {
      subjectRoom[subject].push([room.name, room.subjectDetails[subject]]);
    }
  }

  return await makePDF(rooms, title, dateOfExam);
}

const getFormattedDate = (time) => {
  if (!time) return ""
  return format(parseJSON(time), "iiii, dd MMMM yyyy")
}

async function makePDF(rooms, title, dateOfExam) {
  const simpleDateOfExam = getFormattedDate(new Date(dateOfExam));

  const examDetails = {
    title, dateOfExam: simpleDateOfExam
  }

  for (let room of rooms)
    room.topArray = getSolutionMatrix(room.seats, room.rows, room.columns);

  const resolvedTemplateAsStr = await ejs.renderFile(path.join(__dirname, 'template.ejs'), {
    rooms,
    examDetails
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(resolvedTemplateAsStr);
  await page.emulateMediaType('screen');
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  })

  console.log('Created pdf');

  await browser.close();
  return pdf;
}

module.exports = getPDF