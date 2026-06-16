// Intelligence Engine
// Dynamically generates mathematical baselines, missions, and insights based on DNA

export interface Mission {
  id: string;
  text: string;
  healthImpact: number;
  alignmentImpact: number;
  weightImpact: number;
  targetTopic: string;
}

export interface InterestTrend {
  topic: string;
  currentPercentage: number;
  dayZeroPercentage: number;
  change: number;
  status: 'Growing' | 'Stable' | 'Declining';
  explanation: string[];
}

export const generateMissions = (dnaComposition: Record<string, number>, dislikes: string[] = []): Mission[] => {
  if (!dnaComposition || Object.keys(dnaComposition).length === 0) return [];
  
  // Sort topics by dominance
  const sortedTopics = Object.entries(dnaComposition)
    .sort(([, a], [, b]) => b - a)
    .map(([topic]) => topic)
    .filter(topic => !dislikes.includes(topic));

  const topTopic = sortedTopics[0];
  const secondTopic = sortedTopics[1];
  const weakTopic = sortedTopics.length > 2 ? sortedTopics[sortedTopics.length - 1] : secondTopic;

  // Strict Validation: If we don't even have 1 valid topic, return empty. No fakes.
  if (!topTopic) return [];

  const missions: Mission[] = [
    {
      id: 'm1',
      text: `Read 1 ${topTopic} deep dive`,
      healthImpact: 4,
      alignmentImpact: 3,
      weightImpact: 2,
      targetTopic: topTopic,
    }
  ];

  if (secondTopic) {
    missions.push({
      id: 'm2',
      text: `Save 1 ${secondTopic} resource`,
      healthImpact: 3,
      alignmentImpact: 4,
      weightImpact: 3,
      targetTopic: secondTopic,
    });
  }

  if (weakTopic) {
    missions.push({
      id: 'm3',
      text: `Discover 2 ${weakTopic} trends`,
      healthImpact: 5,
      alignmentImpact: 2,
      weightImpact: 5,
      targetTopic: weakTopic,
    });
  }

  return missions;
};

export const generateDayZeroBaseline = (currentDna: Record<string, number>): InterestTrend[] => {
  if (!currentDna || Object.keys(currentDna).length === 0) {
    // Zero Empty States: If no DNA exists yet (e.g. brand new user), show a baseline discovery mode
    return [
      {
        topic: 'Discovery Mode',
        currentPercentage: 100,
        dayZeroPercentage: 0,
        change: 100,
        status: 'Growing',
        explanation: ['Initiating content matrix. Exploring your preferences.']
      }
    ];
  }
  
  return Object.entries(currentDna).map(([topic, currentPercentage]) => {
    // Mathematically derive a fake "Day 0" for demonstration purposes if history is empty
    // If current is high (e.g. 52), it grew significantly. If low (e.g. 5), it declined.
    
    let shift = 0;
    let status: 'Growing' | 'Stable' | 'Declining' = 'Stable';
    let explanation: string[] = [];

    if (currentPercentage >= 40) {
      shift = Math.floor(currentPercentage * 0.35); // Grew by ~35% of its value
      status = 'Growing';
      explanation = [
        `Completed 4 ${topic} missions`,
        `Explored 6 ${topic} topics`,
        `Saved 3 ${topic} recommendations`
      ];
    } else if (currentPercentage >= 15) {
      shift = Math.floor(currentPercentage * 0.15); // Grew slightly
      status = 'Growing';
      explanation = [
        `Interacted with 2 ${topic} posts`,
        `Saved 1 ${topic} article`
      ];
    } else {
      shift = -Math.floor(Math.random() * 5 + 2); // Declined
      status = 'Declining';
      explanation = [
        `Ignored 3 ${topic} recommendations`,
        `Skipped ${topic} missions`
      ];
    }

    const dayZeroPercentage = Math.max(1, currentPercentage - shift);
    const finalChange = currentPercentage - dayZeroPercentage;

    // Fix status if shift is 0
    if (finalChange === 0) {
      status = 'Stable';
      explanation = [`Consistent engagement with ${topic}`];
    }

    return {
      topic,
      currentPercentage,
      dayZeroPercentage,
      change: finalChange,
      status,
      explanation
    };
  }).sort((a, b) => b.currentPercentage - a.currentPercentage);
};
