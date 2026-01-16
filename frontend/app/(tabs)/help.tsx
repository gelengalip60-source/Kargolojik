import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface HelpTopic {
  id: string;
  title: string;
  short_description: string;
  icon: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const [topics, setTopics] = useState<HelpTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/help-topics`);
      setTopics(response.data.topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (iconName: string): keyof typeof Feather.glyphMap => {
    const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
      'briefcase': 'briefcase',
      'alert-triangle': 'alert-triangle',
      'eye-off': 'eye-off',
      'package': 'package',
      'dollar-sign': 'dollar-sign',
      'file-text': 'file-text',
      'x-circle': 'x-circle',
      'clock': 'clock',
      'tag': 'tag',
      'box': 'box',
      'slash': 'slash',
      'help-circle': 'help-circle',
    };
    return iconMap[iconName] || 'help-circle';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ad Placeholder */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>Reklam Alanı</Text>
        </View>

        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Kargo Sorunları Rehberi</Text>
          <Text style={styles.introText}>
            Kargo süreçlerinde karşılaşılan sorunlar ve çözüm yolları hakkında
            detaylı bilgi edinin.
          </Text>
        </View>

        {/* Topics List */}
        <View style={styles.topicsList}>
          {topics.map((topic, index) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() => router.push(`/help/${topic.id}`)}
            >
              <View style={styles.topicNumber}>
                <Text style={styles.topicNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.topicIconContainer}>
                <Feather
                  name={getIconName(topic.icon)}
                  size={24}
                  color="#1e88e5"
                />
              </View>
              <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription} numberOfLines={2}>
                  {topic.short_description}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Ad Placeholder Bottom */}
        <View style={styles.adBannerBottom}>
          <Text style={styles.adText}>Reklam Alanı</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  adBanner: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    minHeight: 60,
  },
  adBannerBottom: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 8,
    minHeight: 80,
  },
  adText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  introSection: {
    padding: 20,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  topicsList: {
    paddingHorizontal: 16,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topicNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  topicIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
