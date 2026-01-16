import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom header component with logo
const CustomHeader = () => (
  <View style={headerStyles.container}>
    <Image
      source={require('../../assets/images/app-logo.png')}
      style={headerStyles.logo}
      resizeMode="contain"
    />
    <Text style={headerStyles.title}>Kargolojik</Text>
  </View>
);

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1e88e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          paddingBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 4,
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
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Yardım',
          headerTitle: 'Yardım Konuları',
          tabBarIcon: ({ color, size }) => (
            <Feather name="help-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Şube Ara',
          headerTitle: 'Şube Arama',
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
