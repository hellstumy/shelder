// Game state utility functions
const generateGameScenario = (players) => {
  const scenarios = JSON.parse(fs.readFileSync(path.resolve("./gameScenarios.json"), "utf-8"));
  
  // Randomly select scenario elements
  const apocalypseScenario = scenarios.apocalypseScenarios[Math.floor(Math.random() * scenarios.apocalypseScenarios.length)];
  const bunkerDescription = scenarios.bunkerDescriptions[Math.floor(Math.random() * scenarios.bunkerDescriptions.length)];
  
  // Generate random supplies
  const gameSupplies = scenarios.supplies.map(supply => ({
    ...supply,
    quantity: Math.floor(Math.random() * (supply.maxQuantity - supply.minQuantity + 1)) + supply.minQuantity
  }));

  // Calculate required survivors based on player count
  const requiredSurvivors = Math.max(2, Math.ceil(players.length * 0.4)); // 40% of initial players, minimum 2

  return {
    apocalypseScenario,
    bunkerDescription,
    supplies: gameSupplies,
    requiredSurvivors
  };
};