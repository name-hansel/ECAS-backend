const { isSeatEmpty } = require("./utils")

/**
 * Returns two unique points lying between 0 and length of parent
 * @param {array} parentLength
 */
function generateBreakpoints(parentLength) {
  var breakPoint1 = Math.floor(Math.random() * (parentLength - 1));
  var breakPoint2 = Math.floor(Math.random() * (parentLength - breakPoint1 - 1)) + breakPoint1 + 1;
  return [breakPoint1, breakPoint2]
}

/**
 * Initializes a chromosome with room no., row no., and column no.
 * @param {array} roomDetails
 */
function initializeChromosome(data) {
  const chromosome = []
  for (let i = 0; i < data.length; i++) {
    const rows = Number(data[i][0]);
    const columns = Number(data[i][1]);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        chromosome.push([i, row, column, []])
      }
    }
  }
  return chromosome;
}

module.exports = function crossover(parentOne, parentTwo, roomDetails, emptySeats) {
  const geneLength = parentOne.length;

  // Initialize offspring using room details 
  const offspring = initializeChromosome(roomDetails);

  // Generate 2 breakpoints
  const [b1, b2] = generateBreakpoints(geneLength);

  // Create object which indicates which seats are already present in offspring
  const elementsAlreadyPresentInOffspring = {};

  // Keep track of number of empty seats in offspring
  var numberOfEmptySeats = 0;

  // Copy genes from parent 1 to offspring between breakpoints
  for (let i = b1; i <= b2; i++) {
    offspring[i][3] = parentOne[i][3];
    if (isSeatEmpty(parentOne[i])) numberOfEmptySeats++;
    else elementsAlreadyPresentInOffspring[parentOne[i][3][0]] = 1;
  }

  // Extract seats from parent 2 which are not present in offspring
  var index = (b2 + 1) % geneLength;
  var elementsToPush = [];
  do {
    // If seat is empty, simply push
    if (!isSeatEmpty(parentTwo[index])) {
      if (elementsAlreadyPresentInOffspring[parentTwo[index][3][0]] !== 1)
        elementsToPush.push(parentTwo[index])
    } else {
      elementsToPush.push(parentTwo[index])
    }
    index = (index + 1) % geneLength;
  } while (index !== (b2 + 1) % geneLength);

  var i = (b2 + 1) % geneLength;
  var j = 0;
  while (j < elementsToPush.length) {
    // Seat is not empty, simply add to offspring
    if (!isSeatEmpty(elementsToPush[j])) {
      offspring[i][3] = elementsToPush[j][3];
      j++;
      i = (i + 1) % geneLength;
      continue;
    }

    // Seat is empty, check number of empty seats in offspring
    if (numberOfEmptySeats < emptySeats) {
      // Add empty seat to offspring
      numberOfEmptySeats++;
      offspring[i][3] = elementsToPush[j][3];
      j++;
      i = (i + 1) % geneLength;
      continue;
    } else {
      // Number of empty seats has exceeded
      j++;
    }
  }

  return offspring
}