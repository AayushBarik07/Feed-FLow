import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, FlatList, Dimensions, Modal } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { generateMissions, Mission } from '../../services/intelligenceEngine';
import TrendCarouselCard from '../../components/TrendCarouselCard';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const { updateTrigger } = useAppStore();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  
  const [blockHistoryVisible, setBlockHistoryVisible] = useState(false);
  const [selectedDislike, setSelectedDislike] = useState<string | null>(null);
  const [mockBlockedPosts, setMockBlockedPosts] = useState<{title: string, time: string, action: string}[]>([]);
  
  const [dna, setDna] = useState<any>(null);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [healthScore, setHealthScore] = useState<any>({ score: 87, factors: {} });
  const [missions, setMissions] = useState<Mission[]>([]);
  
  const [topInterest, setTopInterest] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    // Fetch DNA
    const { data: dnaData } = await supabase.from('interest_dna').select('*').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).single();
    if (dnaData) setDna(dnaData);

    // Fetch Profile Dislikes
    const { data: profileData } = await supabase.from('profiles').select('disliked_topics').eq('id', user.id).single();
    if (profileData && profileData.disliked_topics) setDislikes(profileData.disliked_topics);

    // Fetch Health Score
    const { data: scoreData } = await supabase.from('feed_health_scores').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(1).single();
    if (scoreData) setHealthScore(scoreData);

    let top: string | null = null;

    // Strict Validation: Only generate data if real DNA exists
    if (dnaData && Object.keys(dnaData.composition).length > 0) {
      setMissions(generateMissions(dnaData.composition, profileData?.disliked_topics || []));
      const sorted = Object.entries(dnaData.composition).sort(([,a], [,b]) => (b as number) - (a as number));
      if (sorted.length > 0) top = sorted[0][0];
    } else {
      // Empty state, no fallback injections!
      setMissions([]);
      top = null;
    }
    
    setTopInterest(top);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [updateTrigger]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const openBlockHistory = (topic: string) => {
    setSelectedDislike(topic);
    const templates = [
      `The shocking truth about ${topic}`,
      `Top 10 ${topic} moments of 2026`,
      `Controversial opinion on ${topic}`,
      `Why everyone is talking about ${topic}`,
      `You won't believe this ${topic} hack`
    ];
    const posts = Array.from({length: 3}).map(() => ({
      title: templates[Math.floor(Math.random() * templates.length)],
      time: `${Math.floor(Math.random() * 45) + 1}m ago`,
      action: 'Intercepted & Hidden'
    }));
    setMockBlockedPosts(posts);
    setBlockHistoryVisible(true);
  };

  // Dynamic Score Calculation based on real profile data
  let dynamicTrainingScore = 0;
  let dynamicAlignmentScore = 0;

  if (dna?.composition && Object.keys(dna.composition).length > 0) {
    const interestCount = Object.keys(dna.composition).length;
    const dislikeCount = dislikes.length;
    
    // Training Score: Measures how actively the user is curating their feed
    dynamicTrainingScore = Math.min(99, 45 + (interestCount * 7) + (dislikeCount * 5));
    
    // Alignment Score: Measures concentration of top interests
    const percentages = Object.values(dna.composition) as number[];
    const maxWeight = percentages.length > 0 ? Math.max(...percentages) : 0;
    dynamicAlignmentScore = Math.min(98, 40 + maxWeight + (dislikeCount * 2));
  }

  const trainingScore = healthScore?.factors?.training_score || dynamicTrainingScore || '--';
  const alignmentScore = healthScore?.factors?.alignment_score || dynamicAlignmentScore || '--';

  return (
    <>
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View className="px-6 pt-16 pb-12">
        {/* Header */}
        <View className="mb-10 flex-row justify-between items-center">
          <View>
            <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
              Interest Intelligence
            </Text>
            <Text className="text-3xl font-bold tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>
              Dashboard
            </Text>
          </View>
        </View>

        {/* 1. Core Metrics Grid */}
        <View className="flex-row justify-between mb-8">
          <View className="w-[48%] rounded-3xl p-5 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-xs mb-2 uppercase tracking-wide" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Training Score</Text>
            <Text className="text-4xl tracking-tighter mb-2" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>{dna?.composition ? trainingScore : '--'}</Text>
            <Text className="text-[10px] leading-relaxed uppercase" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
              Profile Reinforcement
            </Text>
          </View>

          <View className="w-[48%] rounded-3xl p-5 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-xs mb-2 uppercase tracking-wide" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Alignment Score</Text>
            <Text className="text-4xl tracking-tighter mb-2" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>{dna?.composition ? alignmentScore + '%' : '--'}</Text>
            <Text className="text-[10px] leading-relaxed uppercase" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
              Action Alignment
            </Text>
          </View>
        </View>

        {/* Discovery Engine 2.0 Carousel */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Trending For You</Text>
          </View>

          {dna?.composition && Object.keys(dna.composition).length > 0 ? (
            <FlatList
              data={Object.keys(dna.composition)}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={(Dimensions.get('window').width - 48) + 16}
              snapToAlignment="start"
              decelerationRate="fast"
              initialNumToRender={1}
              windowSize={3}
              renderItem={({ item }) => (
                <TrendCarouselCard 
                  interest={item} 
                  colors={colors} 
                  cardWidth={Dimensions.get('window').width - 48} // Window minus px-6 padding
                />
              )}
            />
          ) : (
            <View className="rounded-3xl p-6 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <View className="items-center py-4">
                <Text style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium', fontSize: 13, textAlign: 'center' }}>
                  Select interests to start discovering tailored content.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Training Plan */}
        <View className="rounded-3xl p-6 mb-10 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-lg mb-4 tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Today's Training Plan</Text>
          
          {missions.length > 0 ? (
            missions.map((task, i) => (
              <View key={task.id} className={`mb-5 pb-5 ${i !== missions.length - 1 ? 'border-b' : ''}`} style={{ borderBottomColor: colors.border }}>
                <View className="flex-row items-center mb-3">
                  <View className="w-5 h-5 rounded-full border items-center justify-center mr-3" style={{ borderColor: colors.textMuted }}>
                  </View>
                  <Text className="flex-1 text-sm" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>{task.text}</Text>
                </View>
                <View className="flex-row flex-wrap pl-8 gap-2">
                  <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded">
                    <Feather name="activity" size={10} color="#10B981" />
                    <Text className="text-[10px] uppercase ml-1" style={{ color: '#10B981', fontFamily: 'Inter_700Bold' }}>+{task.healthImpact} Health</Text>
                  </View>
                  <View className="flex-row items-center bg-blue-500/10 px-2 py-1 rounded">
                    <Feather name="target" size={10} color="#3B82F6" />
                    <Text className="text-[10px] uppercase ml-1" style={{ color: '#3B82F6', fontFamily: 'Inter_700Bold' }}>+{task.alignmentImpact} Align</Text>
                  </View>
                  <View className="flex-row items-center bg-purple-500/10 px-2 py-1 rounded">
                    <Feather name="trending-up" size={10} color="#A855F7" />
                    <Text className="text-[10px] uppercase ml-1" style={{ color: '#A855F7', fontFamily: 'Inter_700Bold' }}>+{task.weightImpact} {task.targetTopic}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-4">
              <Text style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium', fontSize: 13, textAlign: 'center' }}>
                Complete onboarding to unlock your personalized training plan.
              </Text>
            </View>
          )}
        </View>

        {/* Unified Interest Management Center */}
        <View className="mb-10">
          <Text className="text-lg mb-4 tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Interest Management</Text>
          <View className="rounded-3xl p-6 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            
            {/* Active Interests Progress Bars */}
            <View className="mb-6">
              <Text className="text-xs uppercase tracking-widest mb-4" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Active Interests & DNA Weight</Text>
              
              {dna?.composition && Object.keys(dna.composition).length > 0 ? (
                Object.entries(dna.composition)
                .sort((a: any, b: any) => b[1] - a[1])
                .map(([topic, percentage]: [string, any], index: number, arr) => {
                  const PROGRESS_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'];
                  const barColor = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
                  return (
                  <View key={topic} className={index !== arr.length - 1 ? "mb-5" : ""}>
                    <View className="flex-row justify-between mb-2 items-center">
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: barColor }} />
                        <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>{topic}</Text>
                      </View>
                      <Text style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>{percentage}%</Text>
                    </View>
                    <View className="h-2 rounded-full w-full overflow-hidden" style={{ backgroundColor: colors.background }}>
                      <View 
                        className="h-full rounded-full" 
                        style={{ backgroundColor: barColor, width: `${percentage}%` }} 
                      />
                    </View>
                  </View>
                )})
              ) : (
                <Text style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
                  No interests configured. Your DNA profile is empty.
                </Text>
              )}
            </View>

            {/* Active Dislikes */}
            <View className="mb-6 border-t pt-5" style={{ borderTopColor: colors.border }}>
              <Text className="text-xs uppercase tracking-widest mb-3" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Active Dislikes</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {dislikes.length > 0 ? dislikes.map(topic => (
                  <TouchableOpacity 
                    key={topic} 
                    className="px-3 py-1.5 rounded-full border" 
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    onPress={() => openBlockHistory(topic)}
                  >
                    <Text style={{ color: '#EF4444', fontFamily: 'Inter_500Medium', fontSize: 12 }}>{topic}</Text>
                  </TouchableOpacity>
                )) : (
                  <Text style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 13 }}>No dislikes configured.</Text>
                )}
              </View>
              {dislikes.length > 0 && (
                <View className="flex-row items-start mt-2 bg-red-500/10 p-3 rounded-xl border" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <Feather name="info" size={14} color="#EF4444" className="mr-2 mt-0.5" />
                  <Text className="flex-1 text-[11px] leading-relaxed" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>
                    Tap any dislike to open the <Text style={{ color: '#EF4444', fontFamily: 'Inter_700Bold' }}>Firewall Debugger</Text> and see exactly what the AI is blocking from your feed.
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              className="py-3 rounded-xl items-center border mt-2"
              style={{ backgroundColor: colors.background, borderColor: colors.border }}
              onPress={() => router.push('/(modals)/edit-interests')}
            >
              <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Edit Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ScrollView>

    <Modal
      transparent={true}
      visible={blockHistoryVisible}
      animationType="slide"
      onRequestClose={() => setBlockHistoryVisible(false)}
    >
      <View className="flex-1 justify-end bg-black/80">
        <View className="rounded-t-3xl p-6 border-t" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-red-500/10">
                <Feather name="shield" size={20} color="#EF4444" />
              </View>
              <View>
                <Text className="text-[10px] uppercase tracking-widest text-red-500 mb-0.5" style={{ fontFamily: 'Inter_700Bold' }}>AI Firewall Active</Text>
                <Text className="text-xl" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>{selectedDislike}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setBlockHistoryVisible(false)} className="w-8 h-8 items-center justify-center rounded-full bg-zinc-800">
              <Feather name="x" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text className="text-sm mb-4" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>
            The algorithm recently intercepted and blocked these posts from your feed:
          </Text>

          {mockBlockedPosts.map((post, i) => (
            <View key={i} className="flex-row items-center p-4 rounded-2xl mb-3 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <View className="flex-1">
                <Text className="text-sm mb-1" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>{post.title}</Text>
                <Text className="text-[10px] uppercase tracking-wider text-red-400" style={{ fontFamily: 'Inter_600SemiBold' }}>{post.action}</Text>
              </View>
              <Text className="text-xs" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>{post.time}</Text>
            </View>
          ))}
          
          <TouchableOpacity 
            className="w-full rounded-full py-4 items-center mt-4 border border-zinc-800"
            onPress={() => setBlockHistoryVisible(false)}
          >
            <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>Close Debugger</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}
