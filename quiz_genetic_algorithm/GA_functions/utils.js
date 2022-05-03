const getRandomQuestions = (total, required) => {
  const questions = [];
  const map = {};

  while (questions.length < required) {
    var r = Math.floor(Math.random() * total) + 1;
    if (!map[r]) {
      questions.push(r);
      map[r] = true;
    }
  }
  return questions.sort((a, b) => a - b)
}

function shuffleChromosome(chromosome) {
  const returnChromosome = JSON.parse(JSON.stringify(chromosome));
  for (var i = returnChromosome.length - 1; i > 0;) {
    var j = Math.floor(Math.random() * (i + 1));
    if (returnChromosome[i][2][0] === null) {
      i--;
      continue;
    }
    if (returnChromosome[j][2][0] === null) continue;
    var temp = returnChromosome[i][2][1];
    returnChromosome[i][2][1] = returnChromosome[j][2][1];
    returnChromosome[j][2][1] = temp;
    i--;
  }
  return returnChromosome;
}

function isSeatEmpty(seat) {
  return seat[2] === null
}

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

function getNeighbourQuestions(chromosome, neighbour, ROWS) {
  for (let i = 0; i < chromosome.length; i++) {
    let seat = chromosome[i];
    if (seat[0] === neighbour[0] && seat[1] === neighbour[1]) return seat[2][1];
  }
}

function getArraySum(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++)
    sum += array[i];
  return sum
}

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

function calculateAverageFitnessForGeneration(population, POPULATION_SIZE) {
  var totalGenerationFitness = 0;
  for (let i = 0; i < POPULATION_SIZE; i++)
    totalGenerationFitness += population[i].fitness;
  return totalGenerationFitness / POPULATION_SIZE;
}

function printLayout(chromosome, ROWS, COLUMNS) {
  let seat = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      if (chromosome[seat][2] === null) break;
      process.stdout.write(`${chromosome[seat][2][0]}: ${chromosome[seat][2][1]}\t\t`);
      seat++;
    }
    process.stdout.write("\n");
  }
}

module.exports = {
  getRandomQuestions, shuffleChromosome, isSeatEmpty, isValidNeighbour, getNeighbourQuestions, getArraySum, shuffleMatingPool, calculateAverageFitnessForGeneration, printLayout
}