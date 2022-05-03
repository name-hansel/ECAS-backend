/**
 * Returns an object containing dissimilarity-factor of each subject pair
 * @param {array} array 2D array containing similarity-factor for each subject pair
 */
function getSubjectDissimilarity(data) {
  const numberOfSubjects = data[0].length - 1;
  const subjectDissimilarityData = {};

  for (let i = 1; i <= numberOfSubjects; i++) {
    let subjectName = data[0][i];
    subjectDissimilarityData[subjectName] = {};
    for (let j = 1; j <= numberOfSubjects; j++) {
      let subjectName2 = data[j][0];
      subjectDissimilarityData[subjectName][subjectName2] = 1 - Number(data[i][j]);
    }
  }
  return subjectDissimilarityData;
}

/**
 * Calculates total number of seats in all rooms
 * @param {array} data Array containing another array which defines number of rows and columns in a room
 */
function getNumberOfSeats(data) {
  let numberOfSeats = 0;
  for (let i = 0; i < data.length; i++) {
    numberOfSeats += Number(data[i][0]) * Number(data[i][1])
  }
  return numberOfSeats
}

/**
 * Shuffles a chromosome and returns the shuffled chromosome
 * @param {array} chromosome Chromosome to be shuffled
 */
function shuffleChromosome(chromosome) {
  const returnChromosome = JSON.parse(JSON.stringify(chromosome));
  for (var i = returnChromosome.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = returnChromosome[i][3];
    returnChromosome[i][3] = returnChromosome[j][3];
    returnChromosome[j][3] = temp;
  }
  return returnChromosome;
}

/**
 * Checks if the seat is empty and returns true if it is, and false if not
 * @param {array} seat Seat containing room no., row no., column no., and student details
 */
function isSeatEmpty(seat) {
  return seat[3].length === 0
}

/**
 * Checks if the seat the neighbour is in is valid depending on room dimensions and returns true or false
 * @param {array} neighbour Array containing neighbour row and column
 * @param {number} room Dimensions of a room
 */
function isValidNeighbour(neighbour, room) {
  // Check if neighbour row and column is valid
  // Neighbour is not a valid seat as 
  if (neighbour[0] === -1 || neighbour[1] === -1)
    return false
  // Neighbour is out of row and column of that room
  if (neighbour[0] + 1 > room[0] || neighbour[1] + 1 > room[1])
    return false
  return true
}

/**
 * Gets student details about a particular neighbour seat using room no., row no., and column no.
 * @param {array} chromosome Array containing data about all seats
 * @param {number} room Room number of seat
 * @param {number} row Row number of seat
 * @param {number} column Column number of seat
 */
function getNeighbourDetails(chromosome, room, row, column) {
  for (let i = 0; i < chromosome.length; i++) {
    if (chromosome[i][0] !== room) continue;
    if (chromosome[i][1] !== row) continue;
    if (chromosome[i][2] !== column) continue;
    return [room, row, column, chromosome[i][3]]
  }
}

/**
 * Calculates distance between 2 seats
 * @param {array} v1 Array containing row and column number of seat 1
 * @param {array} v2 Array containing row and column number of seat 2
 */
function getDistanceBetweenNeighbours(v1, v2) {
  return Math.pow((v1[0] - v2[0]), 2) + Math.pow((v1[1] - v2[1]), 2);
}

// TODO add description
function minimumFitness(fitness) {
  const length = fitness.length;
  var min = fitness[0];
  for (let i = 0; i < length; i++) {
    if (fitness[i] < min)
      min = fitness[i];
  }
  return min;
}

/**
 * Calculates sum of elements in an array
 * @param {array} array Array whose sum is to be calculated
 */
function getArraySum(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum;
}

/**
 * Shuffles a population and returns the shuffled population
 * @param {array} population Population to be shuffled
 */
function shuffleMatingPool(population) {
  const returnPopulation = JSON.parse(JSON.stringify(population));
  for (var i = returnPopulation.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = returnPopulation[i];
    returnPopulation[i] = returnPopulation[j];
    returnPopulation[j] = temp;
  }
  return returnPopulation;
}

module.exports = {
  getSubjectDissimilarity,
  getNumberOfSeats,
  shuffleChromosome,
  isSeatEmpty,
  isValidNeighbour,
  getNeighbourDetails,
  getDistanceBetweenNeighbours,
  minimumFitness,
  getArraySum,
  shuffleMatingPool
}