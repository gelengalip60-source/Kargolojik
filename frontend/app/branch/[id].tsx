import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import BannerAd from '../../components/BannerAd';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Company logos mapping
const COMPANY_LOGOS: Record<string, any> = {
  'Aras Kargo': require('../../assets/images/aras-logo.png'),
  'DHL Kargo': require('../../assets/images/dhl-logo.png'),
  'PTT Kargo': require('../../assets/images/ptt-logo.png'),
  'Sürat Kargo': require('../../assets/images/surat-logo.png'),
  'TNT Kargo': require('../../assets/images/tnt-logo.png'),
  'UPS Kargo': require('../../assets/images/ups-logo.png'),
  'Yurtiçi Kargo': require('../../assets/images/yurtici-logo.png'),
  'Inter Global Kargo': require('../../assets/images/inter-global-logo.png'),
};

interface Branch {
  id: string;
  name: string;
  company: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  working_hours: Record<string, string>;
  google_maps_url: string;
  logo_url: string;
}

export default function BranchDetailScreen() {
  const { id } = useLocalSearchParams();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranch();
  }, [id]);

  const fetchBranch = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/branches/${id}`);
      setBranch(response.data);
    } catch (error) {
      console.error('Error fetching branch:', error);
      Alert.alert('Hata', 'Şube bilgisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (branch?.phone) {
      const phoneNumber = branch.phone.replace(/\s/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleOpenMaps = () => {
    if (branch?.google_maps_url) {
      Linking.openURL(branch.google_maps_url);
    } else if (branch?.address) {
      const query = encodeURIComponent(`${branch.name} ${branch.address}`);
      const url = Platform.select({
        ios: `maps:?q=${query}`,
        android: `geo:0,0?q=${query}`,
        default: `https://www.google.com/maps/search/?api=1&query=${query}`,
      });
      Linking.openURL(url as string);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  if (!branch) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Şube bulunamadı</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: branch.name }} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Ad Placeholder */}
          <View style={styles.adBanner}>
            <Text style={styles.adText}>Reklam Alanı</Text>
          </View>

          {/* Branch Header */}
          <View style={styles.headerCard}>
            {/* Company Logo */}
            {branch.company && COMPANY_LOGOS[branch.company] && (
              <View style={styles.logoContainer}>
                <Image
                  source={COMPANY_LOGOS[branch.company]}
                  style={styles.companyLogo}
                  resizeMode="contain"
                />
              </View>
            )}
            {/* Show company badge only if no logo available */}
            {(!branch.company || !COMPANY_LOGOS[branch.company]) && (
              <View style={styles.companyBadge}>
                <Text style={styles.companyText}>{branch.company || 'Kargo Şubesi'}</Text>
              </View>
            )}
            <Text style={styles.branchName}>{branch.name}</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={16} color="#1e88e5" />
              <Text style={styles.locationText}>
                {branch.city} / {branch.district}
              </Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>İletişim Bilgileri</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Feather name="home" size={20} color="#1e88e5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adres</Text>
                <Text style={styles.infoValue}>{branch.address || 'Adres bilgisi mevcut değil'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Feather name="phone" size={20} color="#1e88e5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{branch.phone || 'Telefon bilgisi mevcut değil'}</Text>
              </View>
            </View>

            {branch.working_hours && Object.keys(branch.working_hours).length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Feather name="clock" size={20} color="#1e88e5" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Çalışma Saatleri</Text>
                    {Object.entries(branch.working_hours).map(([day, hours]) => (
                      <View key={day} style={styles.hoursRow}>
                        <Text style={styles.dayText}>
                          {day === 'weekdays' ? 'Hafta İçi' : 
                           day === 'saturday' ? 'Cumartesi' : 
                           day === 'sunday' ? 'Pazar' : day}
                        </Text>
                        <Text style={styles.hoursText}>{hours}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton]}
              onPress={handleCall}
            >
              <Feather name="phone" size={22} color="#ffffff" />
              <Text style={styles.actionButtonText}>Şubeyi Ara</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.mapsButton]}
              onPress={handleOpenMaps}
            >
              <Feather name="navigation" size={22} color="#ffffff" />
              <Text style={styles.actionButtonText}>Yol Tarifi Al</Text>
            </TouchableOpacity>
          </View>

          {/* Banner Ad */}
          <BannerAd />

          {/* Info Note */}
          <View style={styles.noteCard}>
            <Feather name="info" size={20} color="#f59e0b" />
            <Text style={styles.noteText}>
              Şube bilgileri kargolojik.com'dan alınmıştır. Güncel bilgiler için
              şubeyi arayarak teyit etmenizi öneririz.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 80,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
  },
  companyBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  companyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e88e5',
  },
  branchName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    color: '#64748b',
    marginLeft: 8,
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#64748b',
  },
  hoursText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  callButton: {
    backgroundColor: '#1e88e5',
  },
  mapsButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
});
