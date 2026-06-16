import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fetchRealTrends, fetchTopicNews, TrendData } from '../services/trendService';
import { generateRecommendationExplanation } from '../services/geminiService';

interface TrendCarouselCardProps {
  interest: string;
  colors: any;
  cardWidth: number;
}

export default function TrendCarouselCard({ interest, colors, cardWidth }: TrendCarouselCardProps) {
  const [loadingDiscovery, setLoadingDiscovery] = useState(true);
  const [recommendedTrends, setRecommendedTrends] = useState<TrendData | null>(null);
  const [trendExplanations, setTrendExplanations] = useState<Record<string, string>>({});
  const [topicNews, setTopicNews] = useState<Record<string, string>>({});

  const refreshTrendsData = async () => {
    setLoadingDiscovery(true);
    try {
      const trends = await fetchRealTrends(interest);
      setRecommendedTrends(trends);
      
      const explanations: Record<string, string> = {};
      const news: Record<string, string> = {};
      
      for (const topic of trends.topics.slice(0, 3)) {
        explanations[topic] = await generateRecommendationExplanation(topic, interest);
        news[topic] = await fetchTopicNews(topic, interest);
      }
      setTrendExplanations(explanations);
      setTopicNews(news);
    } catch (error) {
      console.log(`Discovery failed to load for ${interest}`, error);
    }
    setLoadingDiscovery(false);
  };

  useEffect(() => {
    refreshTrendsData();
  }, [interest]);

  return (
    <View style={{ width: cardWidth, marginRight: 16 }}>
      <View className="rounded-3xl p-6 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        {loadingDiscovery ? (
          <View className="py-6 items-center justify-center">
            <ActivityIndicator color="#3B82F6" />
            <Text className="mt-4 text-[10px] uppercase tracking-widest text-center" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
              Analyzing global trends for {interest}...
            </Text>
          </View>
        ) : recommendedTrends ? (
          <>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xs uppercase tracking-widest" style={{ color: '#3B82F6', fontFamily: 'Inter_700Bold' }}>
                Discover Next in {interest}
              </Text>
              <TouchableOpacity onPress={refreshTrendsData} className="p-1">
                <Feather name="refresh-cw" size={12} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            {recommendedTrends.topics.slice(0, 3).map((topic, i) => (
              <View key={i} className="mb-4 pb-4 border-b" style={{ borderBottomColor: i === 2 ? 'transparent' : colors.border }}>
                <Text className="text-base mb-2" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>{topic}</Text>
                <View className="flex-row items-start bg-blue-500/10 p-3 rounded-xl">
                  <Feather name="cpu" size={14} color="#3B82F6" className="mr-2 mt-0.5" />
                  <Text className="flex-1 text-[11px] leading-relaxed" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>
                    {trendExplanations[topic] || `Identified as a high-growth concept aligning with your core profile DNA for ${interest}.`}
                  </Text>
                </View>
                {topicNews[topic] && (
                  <TouchableOpacity 
                    className="flex-row items-start mt-2 bg-zinc-900/40 p-3 rounded-xl"
                    onPress={() => Linking.openURL(`https://news.google.com/search?q=${encodeURIComponent(topic)}`)}
                  >
                    <Feather name="trending-up" size={14} color="#10B981" className="mr-2 mt-0.5" />
                    <Text className="flex-1 text-[11px] leading-relaxed" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }} numberOfLines={2}>
                      <Text style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>LATEST: </Text>
                      {topicNews[topic]}
                    </Text>
                    <Feather name="external-link" size={12} color={colors.textMuted} className="ml-2 mt-0.5" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        ) : (
          <View className="items-center py-4 justify-center">
            <Text style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium', fontSize: 13, textAlign: 'center' }}>
              Failed to load trends for {interest}.
            </Text>
            <TouchableOpacity onPress={refreshTrendsData} className="mt-4 px-4 py-2 rounded-full border" style={{ borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium', fontSize: 12 }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
