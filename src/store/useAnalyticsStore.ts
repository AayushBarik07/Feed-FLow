import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

interface AnalyticsState {
  recordInterestInteraction: (topic: string, type: 'like' | 'favorite' | 'explore' | 'save', weight?: number) => Promise<void>;
  recordDiscoveryAction: (actionType: 'click_suggested_topic' | 'click_suggested_creator' | 'open_feed_card', targetTopic: string) => Promise<void>;
  recordMissionProgress: (missionId: string, isCompleted: boolean) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  recordInterestInteraction: async (topic, type, weight = 1) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    await supabase.from('interest_interactions').insert({
      user_id: user.id,
      topic,
      interaction_type: type,
      weight
    });
  },

  recordDiscoveryAction: async (actionType, targetTopic) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await supabase.from('discovery_actions').insert({
      user_id: user.id,
      action_type: actionType,
      target_topic: targetTopic
    });
  },

  recordMissionProgress: async (missionId, isCompleted) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await supabase.from('daily_missions').update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    }).eq('id', missionId).eq('user_id', user.id);
  }
}));
