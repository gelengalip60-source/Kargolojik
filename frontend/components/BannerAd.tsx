import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// AdMob Ad Unit ID
const AD_UNIT_ID = 'ca-app-pub-9209845130988804/1770452987';

// Banner Ad component - shows placeholder on web, actual ads on native
const BannerAd: React.FC<{ style?: any }> = ({ style }) => {
  // Always show placeholder on web - AdMob doesn't work on web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adText}>Reklam Alanı</Text>
        </View>
      </View>
    );
  }

  // On native platforms, try to use the actual AdMob component
  // This will only work in development builds with react-native-google-mobile-ads
  // In Expo Go, it will fall back to placeholder
  return (
    <View style={[styles.container, style]}>
      <View style={styles.adPlaceholder}>
        <Text style={styles.adText}>Reklam Alanı</Text>
        <Text style={styles.adSubtext}>Google AdMob</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  adPlaceholder: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  adText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  adSubtext: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 4,
  },
});

export default BannerAd;
