const ejs = require("ejs");
const puppeteer = require('puppeteer');
const path = require("path");

const getPDF = async (data, questions, title) => {
  // Create pdf
  const resolvedTemplateAsStr = await ejs.renderFile(path.join(__dirname, 'template.ejs'), {
    rollQuestions: data, questions, title
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(resolvedTemplateAsStr);
  await page.emulateMediaType('screen');
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  })
  await browser.close();
  return pdf;
}

module.exports = getPDF;