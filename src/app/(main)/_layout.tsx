import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#27272a', // zinc-800
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#3b82f6', // blue-500
        tabBarInactiveTintColor: '#a1a1aa', // zinc-400
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
