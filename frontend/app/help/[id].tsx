import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface HelpTopic {
  id: string;
  title: string;
  short_description: string;
  content: string;
  icon: string;
}

export default function HelpDetailScreen() {
  const { id } = useLocalSearchParams();
  const [topic, setTopic] = useState<HelpTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/help-topics/${id}`);
      setTopic(response.data);
    } catch (error) {
      console.error('Error fetching topic:', error);
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

  if (!topic) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>İçerik bulunamadı</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Yardım' }} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Ad Placeholder */}
          <View style={styles.adBanner}>
            <Text style={styles.adText}>Reklam Alanı</Text>
          </View>

          {/* Header */}
          <View style={styles.headerCard}>
            <View style={styles.iconContainer}>
              <Feather
                name={getIconName(topic.icon)}
                size={32}
                color="#1e88e5"
              />
            </View>
            <Text style={styles.title}>{topic.title}</Text>
            <Text style={styles.description}>{topic.short_description}</Text>
          </View>

          {/* Content */}
          <View style={styles.contentCard}>
            <Markdown style={markdownStyles}>{topic.content}</Markdown>
          </View>

          {/* Ad Placeholder Bottom */}
          <View style={styles.adBannerBottom}>
            <Text style={styles.adText}>Reklam Alanı</Text>
          </View>

          {/* Kargolojik Note */}
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Kargolojik</Text>
            <Text style={styles.noteText}>
              Bu içerik bilgilendirme amaçlıdır. Yasal süreçlerde profesyonel
              destek almanızı öneririz.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#1e293b',
    fontSize: 15,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 14,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 12,
  },
  bullet_list: {
    marginBottom: 12,
  },
  bullet_list_icon: {
    color: '#1e88e5',
    marginRight: 8,
  },
  ordered_list: {
    marginBottom: 12,
  },
  list_item: {
    marginBottom: 8,
  },
  blockquote: {
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 4,
    borderLeftColor: '#1e88e5',
    paddingLeft: 16,
    paddingVertical: 12,
    marginVertical: 12,
    borderRadius: 4,
  },
  strong: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  em: {
    fontStyle: 'italic',
  },
  hr: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginVertical: 16,
  },
});

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
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
    marginTop: 16,
    borderRadius: 8,
    minHeight: 80,
  },
  adText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noteCard: {
    backgroundColor: '#e0f2fe',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e88e5',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 20,
  },
});
