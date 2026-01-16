import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import BannerAd from '../../components/BannerAd';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface HelpTopic {
  id: string;
  title: string;
  short_description: string;
  icon: string;
}

interface Stats {
  branches: number;
  help_topics: number;
  companies: number;
  cities: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [helpTopics, setHelpTopics] = useState<HelpTopic[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topicsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/help-topics`),
        axios.get(`${API_URL}/api/stats`),
      ]);
      setHelpTopics(topicsRes.data.topics.slice(0, 4));
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Ad */}
        <BannerAd />

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Kargo Sorunlarınıza</Text>
          <Text style={styles.heroSubtitle}>Çözüm Rehberi</Text>
          <Text style={styles.heroDescription}>
            Türkiye'deki kargo sorunları için profesyonel çözümler ve şube bilgileri
          </Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Feather name="search" size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Şube adı veya şehir ara..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Ara</Text>
          </TouchableOpacity>
        </View>

        {/* Problem Solver Button */}
        <TouchableOpacity
          style={styles.wizardButton}
          onPress={() => router.push('/wizard')}
        >
          <View style={styles.wizardIconContainer}>
            <Feather name="cpu" size={24} color="#ffffff" />
          </View>
          <View style={styles.wizardTextContainer}>
            <Text style={styles.wizardTitle}>Çözüm Robotu</Text>
            <Text style={styles.wizardSubtitle}>
              Adım adım sorununuzu çözün
            </Text>
          </View>
          <Feather name="chevron-right" size={24} color="#10b981" />
        </TouchableOpacity>

        {/* Stats Section */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.branches}+</Text>
              <Text style={styles.statLabel}>Şube</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.cities}</Text>
              <Text style={styles.statLabel}>Şehir</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.help_topics}</Text>
              <Text style={styles.statLabel}>Rehber</Text>
            </View>
          </View>
        )}

        {/* Help Topics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popüler Yardım Konuları</Text>
          <TouchableOpacity onPress={() => router.push('/help')}>
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1e88e5" style={styles.loader} />
        ) : (
          <View style={styles.topicsGrid}>
            {helpTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => router.push(`/help/${topic.id}`)}
              >
                <View style={styles.topicIconContainer}>
                  <Feather
                    name={getIconName(topic.icon)}
                    size={24}
                    color="#1e88e5"
                  />
                </View>
                <Text style={styles.topicTitle} numberOfLines={2}>
                  {topic.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Ad Placeholder Bottom */}
        <View style={styles.adBannerBottom}>
          <Text style={styles.adText}>Reklam Alanı</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Kargolojik © 2025</Text>
          <Text style={styles.footerSubtext}>Tüm hakları saklıdır</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 8,
    minHeight: 80,
  },
  adText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e88e5',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  searchButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  wizardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  wizardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wizardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  wizardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  wizardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 14,
    color: '#1e88e5',
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  topicCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 8,
    paddingBottom: 100, // Space for tab bar
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
