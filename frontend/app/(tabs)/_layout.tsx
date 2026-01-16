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
  
  // Calculate proper tab bar height
  const TAB_BAR_HEIGHT = 56;
  const bottomPadding = Math.max(insets.bottom, 8);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1e88e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: TAB_BAR_HEIGHT + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: '#1e88e5',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
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
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Yardım',
          headerTitle: 'Yardım Konuları',
          tabBarIcon: ({ color, size }) => (
            <Feather name="help-circle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Şube Ara',
          headerTitle: 'Şube Arama',
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
