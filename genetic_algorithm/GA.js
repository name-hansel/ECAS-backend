const { getSubjectDissimilarity, getNumberOfSeats, shuffleChromosome, shuffleMatingPool } = require("./GA_functions/utils");

const fitnessValue = require("./GA_functions/fitnessValue")
const selection = require("./GA_functions/selection")
const crossover = require("./GA_functions/crossover")
const mutation = require("./GA_functions/mutation")

const geneticAlgorithm = (studentDetails, roomDetails, courseDetails) => {
  const POPULATION_SIZE = process.env.POPULATION_SIZE;
  const GENERATION_LIMIT = process.env.GENERATION_LIMIT;
  const MUTATION_RATE = process.env.MUTATION_RATE;

  // Save subject dissimilarity data in an object
  const subjectDissimilarityData = getSubjectDissimilarity(courseDetails);

  // Get total number of seats available
  const numberOfSeats = getNumberOfSeats(roomDetails);
  // Get number of students
  const numberOfStudents = studentDetails.length;
  // Get number of empty seats
  const emptySeats = numberOfSeats - numberOfStudents;
  const allotedSeats = [];

  // Generate initial population
  var studentIndexNumber = 0;
  for (let i = 0; i < roomDetails.length; i++) {
    const rows = Number(roomDetails[i][0]);
    const columns = Number(roomDetails[i][1]);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        // If current student index is greater than number of students, we have more seats than students, so these seats are unoccupied
        if (studentIndexNumber >= numberOfStudents) allotedSeats.push([i, row, column, []])
        else allotedSeats.push([i, row, column, studentDetails[studentIndexNumber++]])
      }
    }
  }

  // A chromosome is a solution; chromosome contains genes
  // Each gene is mapped to one seat and contains properties which define a seat (Room no., row, column, [ roll_number, subject ])
  const population = []
  // First solution is students arranged as ordered in list
  population.push(allotedSeats)

  // Create initial population by shuffling up first solution
  for (let i = 0; i < POPULATION_SIZE - 1; i++) {
    // Make deep copy of initial solution
    const chromosome = JSON.parse(JSON.stringify(allotedSeats));

    // Shuffle student details and add to population
    const newChromosome = shuffleChromosome(chromosome);
    population.push(newChromosome);
  }

  let currentGeneration = 1;
  // Start iterating through generations
  while (currentGeneration <= GENERATION_LIMIT) {
    console.log(`Generation: ${currentGeneration}`);

    // Calculate fitness of each chromosome (solution) in population and store
    const populationWithCalculatedFitness = population.map(solution => fitnessValue(solution, roomDetails, subjectDissimilarityData, numberOfSeats))

    // Sort solutions in a population based on fitness
    populationWithCalculatedFitness.sort((a, b) => {
      return b.fitness - a.fitness;
    })

    // Build a mating pool using elitism
    const [matingPool, nextPopulation] = selection(populationWithCalculatedFitness, 20, POPULATION_SIZE);

    // While next population is not full, keep generating offsprings using random parents from mating pool
    while (nextPopulation.length < POPULATION_SIZE) {
      // Create copy of mating pool to get random elements out of it
      const copyMatingPool = shuffleMatingPool(matingPool);

      // Crossover using first 2 elements of shuffled mating pool
      const offspringA = crossover(copyMatingPool[0], copyMatingPool[1], roomDetails, emptySeats);
      const offspringB = crossover(copyMatingPool[1], copyMatingPool[0], roomDetails, emptySeats);

      // Mutate offspring 1 and 2 here
      const mutatedOffspringA = mutation(offspringA, MUTATION_RATE);
      const mutatedOffspringB = mutation(offspringB, MUTATION_RATE);

      nextPopulation.push(mutatedOffspringA, mutatedOffspringB);
    }

    // Clear previous population
    population.length = 0;

    // Add all offsprings to the population
    population.push(...nextPopulation);

    currentGeneration++;
  }

  // Find best population
  const bestPopulation = population.map(solution => fitnessValue(solution, roomDetails, subjectDissimilarityData, numberOfSeats))
  bestPopulation.sort((a, b) => {
    return b.fitness - a.fitness;
  })
  // Find best solution in the population
  var bestSolution = bestPopulation[0];
  var maxFitness = bestSolution.fitness;
  for (let i = 0; i < POPULATION_SIZE; i++) {
    if (bestPopulation[i].fitness > maxFitness)
      bestSolution = bestPopulation[i]
  }
  return bestSolution;
}

module.exports = geneticAlgorithm;