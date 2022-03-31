const Bull = require('bull');
const nodemailer = require('nodemailer');

const Student = require("../models/Student");
const Notice = require("../models/Notice");

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

const makeNoticeVisible = async (_id) => {
  return await Notice.findByIdAndUpdate(_id, { $set: { visible: true } }, { new: true });
}

const sendMail = async (_id) => {
  try {
    const notice = await makeNoticeVisible(_id);

    // Get semesters from year
    const semesters = [];
    notice.year.forEach(y => {
      semesters.push(y * 2 - 1, y * 2);
    });

    const studentData = await Student.find({ currentSemester: semesters, branch: notice.branch, archived: false }).select('email -_id');
    const emails = studentData.map(student => student.email);
    await nodemailerSendMail(emails, notice.title);
  } catch (err) {
    console.error(err);
  }
}

sendEmailQueue.process(async (job) => await sendMail(job.data._id));

const addEmailJobToQueue = async (_id, sendEmailIn) => {
  // Add job to queue
  const { id } = await sendEmailQueue.add({
    _id
  }, { delay: 1000 * 60 * sendEmailIn });

  // Return job id
  return id;
}

module.exports = { addEmailJobToQueue, cancelJob };