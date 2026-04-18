const MOCK_BLESSINGS = [
  "May your oxygen tanks always be at least 4% full.",
  "Your land is now officially recognized by the Intergalactic HOA.",
  "Warning: Gravity on this plot is strictly optional.",
  "Congratulations! You are now the proud owner of a very expensive rock.",
  "May your space-taxes be low and your signal strength high.",
  "Your neighbors are quiet. Mostly because sound doesn't travel in a vacuum.",
  "This plot is guaranteed 100% free of Earth-based drama."
];

export async function generateGalacticBlessing(planetName: string, userName: string) {
  // Return a random mock blessing
  const randomIndex = Math.floor(Math.random() * MOCK_BLESSINGS.length);
  return MOCK_BLESSINGS[randomIndex];
}

export async function generatePlanetImage(planetName: string) {
  // Return null to fall back to default images
  return null;
}
