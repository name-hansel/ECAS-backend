/**
 * Creates a mating pool, and a part of the new population based on the selection method of elitism, where a certain percentage of parents are simply carried onto the next generation, and only those are chosen to create offspring
 * @param {array} population Current population using which the mating pool will be built
 * @param {number} percentageOfElite Percentage of fittest parents to carry forward
 * @param {number} POPULATION_SIZE Size of population
 */
module.exports = function selection(population, percentageOfElite, POPULATION_SIZE) {
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