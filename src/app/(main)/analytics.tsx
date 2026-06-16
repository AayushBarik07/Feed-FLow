import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { generateDayZeroBaseline, InterestTrend } from '../../services/intelligenceEngine';
import { generateInterestInsight, generateWeeklyReport } from '../../services/geminiService';
import AnimatedBarChart from '../../components/ui/AnimatedBarChart';

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loadingGemini, setLoadingGemini] = useState(true);
  const [dna, setDna] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [trends, setTrends] = useState<InterestTrend[]>([]);
  
  const [weeklyReport, setWeeklyReport] = useState<string>('');
  const [geminiInsights, setGeminiInsights] = useState<Record<string, string>>({});

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoadingGemini(true);
    
    // 1. Fetch DNA
    const { data: dnaData } = await supabase.from('interest_dna').select('*').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).single();
    let currentTrends: InterestTrend[] = [];
    
    if (dnaData) {
      setDna(dnaData);
      currentTrends = generateDayZeroBaseline(dnaData.composition);
      setTrends(currentTrends);
    } else {
      // Zero Empty States
      currentTrends = generateDayZeroBaseline({});
      setTrends(currentTrends);
    }

    // 2. Fetch Health
    const { data: scoreData } = await supabase.from('feed_health_scores').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(1).single();
    if (scoreData) setHealthScore(scoreData);

    // 3. Generate Gemini Intelligence
    if (currentTrends.length >= 2 && currentTrends[0].topic !== 'Discovery Mode') {
      const top = currentTrends[0];
      const bottom = currentTrends[currentTrends.length - 1];
      
      const report = await generateWeeklyReport(top.topic, top.change, bottom.topic, Math.abs(bottom.change));
      setWeeklyReport(report);

      const insights: Record<string, string> = {};
      // Generate insight for top 2 interests
      for (const trend of currentTrends.slice(0, 2)) {
        insights[trend.topic] = await generateInterestInsight(trend.topic, trend.change, trend.explanation);
      }
      setGeminiInsights(insights);
    } else {
      setWeeklyReport("Initializing intelligence matrix. Discovering your core interests.");
    }
    
    setLoadingGemini(false);
  };

  const { updateTrigger } = useAppStore();

  useEffect(() => {
    fetchAnalytics();
  }, [updateTrigger]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };
  const currentTrainingScore = healthScore?.factors?.training_score || 85;
  const mockHistoricalData = [
    Math.max(10, currentTrainingScore - 40),
    Math.max(15, currentTrainingScore - 25),
    Math.max(12, currentTrainingScore - 30),
    Math.max(20, currentTrainingScore - 10),
    currentTrainingScore
  ];
  const chartLabels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Now'];

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View className="px-6 pt-16 pb-12">
        <Text className="text-3xl font-bold tracking-tight mb-8" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>
          Intelligence
        </Text>

        {/* Gemini Weekly Intelligence Report */}
        <View className="rounded-3xl p-6 mb-8 border border-purple-500/30" style={{ backgroundColor: colors.card }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-purple-500/10">
                <Feather name="cpu" size={16} color="#A855F7" />
              </View>
              <Text className="text-lg tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Weekly Analysis</Text>
            </View>
            <View className="bg-purple-500/10 px-2 py-1 rounded">
              <Text className="text-[10px] uppercase text-purple-400 font-bold tracking-widest" style={{ fontFamily: 'Inter_700Bold' }}>Gemini AI</Text>
            </View>
          </View>
          
          {loadingGemini ? (
            <ActivityIndicator color="#A855F7" className="my-2" />
          ) : (
            <Text className="leading-relaxed" style={{ color: colors.text, fontFamily: 'Inter_500Medium', fontSize: 15 }}>
              {weeklyReport}
            </Text>
          )}
        </View>

        {/* Gemini Interest Insight Cards */}
        {Object.keys(geminiInsights).length > 0 && (
          <View className="mb-8 flex-row justify-between">
            {Object.entries(geminiInsights).map(([topic, insight], idx) => (
              <View key={topic} className="w-[48%] rounded-3xl p-5 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text className="text-xs uppercase mb-2 tracking-widest" style={{ color: colors.primary, fontFamily: 'Inter_700Bold' }}>{topic} Insight</Text>
                <Text className="text-xs leading-relaxed" style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Algorithm Reinforcement Velocity Chart */}
        <View className="rounded-3xl p-6 mb-8 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-lg tracking-tight mb-1" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Algorithm Reinforcement Velocity</Text>
          <Text className="text-xs mb-6" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>
            Historical mapping of your active Training Score over the last 5 weeks.
          </Text>
          
          <AnimatedBarChart 
            data={mockHistoricalData} 
            labels={chartLabels} 
            color={colors.primary} 
            height={220}
            textColor={colors.textMuted}
            gridColor={colors.border}
          />
        </View>

        {/* Enhanced Interest Distribution with Status */}
        <View className="rounded-3xl p-6 mb-8 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Interest Distribution</Text>
            <TouchableOpacity 
              className="px-3 py-1.5 rounded-full border" 
              style={{ backgroundColor: colors.background, borderColor: colors.border }}
              onPress={() => router.push('/(modals)/edit-interests')}
            >
              <Text className="text-xs font-medium" style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          {trends.map((trend, index) => (
            <View key={trend.topic} className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center flex-1 pr-4" style={{ flexShrink: 1 }}>
                  <Text className="font-semibold text-base mr-2 flex-shrink-0" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>{trend.topic}</Text>
                  <View className="px-2 py-0.5 rounded border flex-shrink" style={{ 
                    backgroundColor: trend.status === 'Growing' ? 'rgba(16, 185, 129, 0.1)' : trend.status === 'Declining' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    borderColor: trend.status === 'Growing' ? 'rgba(16, 185, 129, 0.3)' : trend.status === 'Declining' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'
                  }}>
                    <Text className="text-[10px] uppercase" style={{ 
                      color: trend.status === 'Growing' ? '#10B981' : trend.status === 'Declining' ? '#EF4444' : '#6B7280', 
                      fontFamily: 'Inter_700Bold' 
                    }} numberOfLines={1}>
                      {trend.change > 0 ? '+' : ''}{trend.change}% • {trend.status}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>{trend.currentPercentage}%</Text>
              </View>
              
              <View className="h-2.5 rounded-full w-full overflow-hidden" style={{ backgroundColor: colors.background }}>
                <View 
                  className="h-full rounded-full" 
                  style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'][index % 10], width: `${trend.currentPercentage}%` }} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Evolution Timeline Baseline */}
        <View className="mb-10">
          <Text className="text-lg mb-4 tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Evolution Timeline Baseline</Text>
          <View className="rounded-3xl border overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row border-b px-5 py-4" style={{ borderBottomColor: colors.border, backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <Text className="flex-1 text-[10px] uppercase tracking-widest" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Topic</Text>
              <Text className="flex-1 text-[10px] uppercase tracking-widest text-center" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Day 0</Text>
              <Text className="flex-1 text-[10px] uppercase tracking-widest text-center" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Current</Text>
              <Text className="flex-1 text-[10px] uppercase tracking-widest text-right" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Shift</Text>
            </View>
            
            {trends.map((trend, i) => (
              <View key={trend.topic} className={`flex-row px-5 py-4 ${i !== trends.length - 1 ? 'border-b' : ''}`} style={{ borderBottomColor: colors.border }}>
                <Text className="flex-1 text-sm" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>{trend.topic}</Text>
                <Text className="flex-1 text-center text-sm" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>{trend.dayZeroPercentage}%</Text>
                <Text className="flex-1 text-center font-bold text-sm" style={{ color: colors.primary, fontFamily: 'Inter_700Bold' }}>{trend.currentPercentage}%</Text>
                <Text className="flex-1 text-right text-sm" style={{ 
                  color: trend.change > 0 ? '#10B981' : trend.change < 0 ? '#EF4444' : colors.textMuted, 
                  fontFamily: 'Inter_700Bold' 
                }}>
                  {trend.change > 0 ? '+' : ''}{trend.change}%
                </Text>
              </View>
            ))}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
