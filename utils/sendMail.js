const Bull = require('bull');
const nodemailer = require('nodemailer');

const Student = require("../models/Student");

const sendEmailQueue = new Bull('email-queue');

const cancelJob = async (jobId) => {
  const job = await sendEmailQueue.getJob(jobId);
  await job.remove();
  return;
}

const nodemailerSendMail = (emails, title) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "pce_examcell@outlook.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const html = `PCE Exam Cell posted a new announcement: ${title}. Click the link view the announcement: //LINK HERE`

  let mailOptions = {
    from: '"PCE Exam Cell " <pce_examcell@outlook.com>',
    to: emails,
    html,
    subject: `PCE Exam Cell posted: ${title}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log(info);
    }
  })
}

const sendMail = async (semesters, branch, title) => {
  try {
    const studentData = await Student.find({ currentSemester: semesters, branch }).select('email -_id');
    const emails = studentData.map(student => student.email);
    await nodemailerSendMail(emails, title);
  } catch (err) {
    console.error(err);
  }
}

sendEmailQueue.process(async (job) => await sendMail(job.data.semesters, job.data.branch, job.data.title));

const addEmailJobToQueue = async (year, branch, sendEmailIn, title) => {
  // Get semesters from year
  const semesters = [];
  year.forEach(y => {
    semesters.push(y * 2 - 1, y * 2);
  });

  // Add job to queue
  const { id } = await sendEmailQueue.add({
    semesters,
    branch,
    title
  }, { delay: 1000 * 60 * sendEmailIn });

  // Return job id
  return id;
}

module.exports = { addEmailJobToQueue, cancelJob };