const Papa = require("papaparse");

const parseCSV = (questionsFile) => {
  const { data } = Papa.parse(questionsFile.toString());
  return data;
}

module.exports = parseCSV;