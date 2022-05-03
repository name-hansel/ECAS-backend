/**
 * Returns two points lying between 0 and length of parent
 * @param {array} parentLength
 */
function generateMutationPoints(parentLength) {
  var indexA = Math.floor(Math.random() * (parentLength - 1));
  var indexB = Math.floor(Math.random() * (parentLength - 1));
  return [indexA, indexB]
}

/**
 * Returns mutated chromosome
 * @param {array} chromosome
 * @param {number} mutationRate
 */
module.exports = function mutation(chromosome, mutationRate) {
  const mutationChance = Math.random();

  // No mutation
  if (mutationRate < mutationChance)
    return chromosome;

  // Create copy of chromosome
  const copyChromosome = JSON.parse(JSON.stringify(chromosome));

  // Choose 2 points in chromosome
  const [indexA, indexB] = generateMutationPoints(copyChromosome.length);

  // Swap students at the two points
  var temp = copyChromosome[indexA][3];
  copyChromosome[indexA][3] = copyChromosome[indexB][3];
  copyChromosome[indexB][3] = temp;

  return copyChromosome;
}
