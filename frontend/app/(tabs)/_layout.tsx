import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Image, StyleSheet } from 'react-native';

// Custom header component with new logo
const CustomHeader = () => (
  <View style={headerStyles.container}>
    <Image
      source={require('../../assets/images/app-logo.png')}
      style={headerStyles.logo}
      resizeMode="contain"
    />
  </View>
);

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 36,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1e88e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: false, // Hide all labels - only icons
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingVertical: 10,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        headerStyle: {
          backgroundColor: '#1e88e5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          headerTitle: () => <CustomHeader />,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Yardım',
          headerTitle: 'Yardım Konuları',
          tabBarIcon: ({ color }) => (
            <Feather name="help-circle" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Şube Ara',
          headerTitle: 'Şube Arama',
          tabBarIcon: ({ color }) => (
            <Feather name="search" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
