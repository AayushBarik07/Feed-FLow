import { generateTopicExpansion } from './geminiService';

export interface TrendData {
  category: string;
  topics: string[];
}

export const fetchRealTrends = async (interest: string): Promise<TrendData> => {
  try {
    // For Tech/Startups/AI, HackerNews is the gold standard real-time signal.
    // If it's a tech topic, we fetch top stories.
    const techTopics = ['Technology', 'AI', 'Startups', 'Software', 'Programming'];
    
    let trendingTopics: string[] = [];

    if (techTopics.includes(interest)) {
      // Fetch top 5 HackerNews stories
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = await response.json();
      const top30Ids = storyIds.slice(0, 30);
      const shuffledIds = top30Ids.sort(() => 0.5 - Math.random());
      const top5Ids = shuffledIds.slice(0, 5);
      const storyPromises = top5Ids.map(async (id: number) => {
        const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const story = await res.json();
        return story.title;
      });
      
      const titles = await Promise.all(storyPromises);
      
      // Clean up titles (just take first few words to act as "topics")
      trendingTopics = titles.map(title => {
        const words = title.split(' ').slice(0, 4).join(' ');
        return words.replace(/[^a-zA-Z0-9 ]/g, '');
      });
    } else {
      // For non-tech topics, rely entirely on Gemini to hallucinate/generate current trends
      trendingTopics = await generateTopicExpansion(interest);
    }

    return {
      category: interest,
      topics: trendingTopics
    };
  } catch (error) {
    console.error('Trend fetch error:', error);
    // Fallback to Gemini
    const fallback = await generateTopicExpansion(interest);
    return {
      category: interest,
      topics: fallback
    };
  }
};

export const fetchTopicNews = async (topic: string, interest: string): Promise<string> => {
  try {
    const res = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(topic + " " + interest)}&hl=en-US&gl=US&ceid=US:en`);
    const text = await res.text();
    const match = text.match(/<item>[\s\S]*?<title>(.*?)<\/title>/);
    if (match && match[1]) {
      return match[1]
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    }
    return `New discussions and emerging trends surrounding ${topic} in the ${interest} space.`;
  } catch (e) {
    return `Recent activity spikes detected for ${topic}.`;
  }
};
