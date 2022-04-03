const { isSeatEmpty, isValidNeighbour, getNeighbourDetails, getDistanceBetweenNeighbours, minimumFitness, getArraySum } = require("./utils");

module.exports = function fitnessValue(chromosome, roomDetails, subjectDissimilarityData, numberOfSeats) {
  const fitnessForEachGene = chromosome.map(gene => {
    // Gene contains [room, row, column, [roll_number,student]]
    const room = gene[0];
    const currentRoomDimensions = roomDetails[room];
    const row = gene[1];
    const column = gene[2];
    const student = gene[3];

    // Check if seat is unoccupied
    // TODO check if it should be 1
    if (isSeatEmpty(gene)) return 0;

    // Get neighbours of a particular seat
    var neighbours = [[row - 1, column], [row, column - 1], [row, column + 1], [row + 1, column],
    [row - 1, column + 1], [row - 1, column - 1], [row + 1, column - 1], [row + 1, column + 1]
    ];
    var validNeighbours = neighbours.filter(neighbour => isValidNeighbour(neighbour, currentRoomDimensions));

    // Get subject details of each neighbour
    validNeighbours = validNeighbours.map(neighbour => getNeighbourDetails(chromosome, room, neighbour[0], neighbour[1]));

    // Iterate through neighbours and calculate fitness for each neighbour
    const geneFitness = validNeighbours.map(neighbour => {
      // Check if neighbour is empty
      if (isSeatEmpty(neighbour)) return 0;

      // Calculate distance between each neighbour
      const distance = getDistanceBetweenNeighbours([row, column], [neighbour[1], neighbour[2]])

      // Calculate subject similarity
      const subjectDissimilarity = subjectDissimilarityData[student[1]][neighbour[3][1]];

      // Calculate fitness
      const fitness = (distance * subjectDissimilarity) / ((Math.pow(Number(currentRoomDimensions[0]), 2)) + Math.pow(Number(currentRoomDimensions[1]), 2));

      return fitness
    })

    // Return minimum of 8 neighbours for each seat
    return minimumFitness(geneFitness);
  })

  const fitness = Math.pow(getArraySum(fitnessForEachGene) / numberOfSeats, 2);

  return { solution: chromosome, fitness }
}