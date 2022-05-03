function generateBreakpoints(parentLength) {
  var breakPoint1 = Math.floor(Math.random() * (parentLength - 1));
  var breakPoint2 = Math.floor(Math.random() * (parentLength - breakPoint1 - 1)) + breakPoint1 + 1;
  return [breakPoint1, breakPoint2]
}

function selection(population, percentageOfElite, POPULATION_SIZE) {
  const matingPool = [];
  const newPopulation = [];

  const numberOfParentsToCarryOver = parseInt((percentageOfElite / 100) * POPULATION_SIZE);

  // If number of parents is 1, increment by 1 since crossover needs at least 2 parents
  if (numberOfParentsToCarryOver === 1) numberOfParentsToCarryOver++;

  // Add the elite parents to mating pool
  matingPool.push(...population.slice(0, numberOfParentsToCarryOver))

  // Add the elite parents to next population
  newPopulation.push(...population.slice(0, numberOfParentsToCarryOver))

  return [matingPool.map(gene => gene.solution), newPopulation.map(gene => gene.solution)];
}

function crossover(parentOne, parentTwo) {
  const geneLength = parentOne.length;
  const offspring = parentOne.map(gene => [gene[0], gene[1], [gene[2][0], []]])

  // Generate 2 breakpoints
  const [b1, b2] = generateBreakpoints(geneLength);

  // Copy genes from parent 1 to offspring between breakpoints
  for (let i = b1; i <= b2; i++) {
    offspring[i][2] = parentOne[i][2];
  }

  // Copy genes from start to b1 from parent two to offspring
  for (let i = 0; i < b1; i++) {
    offspring[i][2] = parentTwo[i][2];
  }

  // From b2 to end
  for (let i = b2 + 1; i < geneLength; i++) {
    offspring[i][2] = parentTwo[i][2];
  }

  return offspring;
}

function generateMutationPoints(parentLength) {
  var indexA = Math.floor(Math.random() * (parentLength - 1));
  var indexB = Math.floor(Math.random() * (parentLength - 1));
  return [indexA, indexB]
}

function mutation(chromosome, mutationRate, EMPTY_SEATS) {
  const mutationChance = Math.random();

  // No mutation
  if (mutationRate < mutationChance)
    return chromosome;

  // Create copy of chromosome
  const copyChromosome = JSON.parse(JSON.stringify(chromosome));

  // Choose 2 points in chromosome
  const [indexA, indexB] = generateMutationPoints(copyChromosome.length - EMPTY_SEATS);
  // Swap students at the two points
  var temp = copyChromosome[indexA][2][1];
  copyChromosome[indexA][2][1] = copyChromosome[indexB][2][1];
  copyChromosome[indexB][2][1] = temp;

  return copyChromosome;
}

module.exports = {
  selection, crossover, mutation
}