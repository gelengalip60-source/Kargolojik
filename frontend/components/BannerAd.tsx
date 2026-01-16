import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// AdMob Ad Unit ID
const AD_UNIT_ID = 'ca-app-pub-9209845130988804/1770452987';

// For web, we show a placeholder
// For native apps, the actual AdMob SDK would be used
const BannerAd: React.FC<{ style?: any }> = ({ style }) => {
  // On web, show placeholder since AdMob doesn't work on web
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adText}>Reklam Alanı</Text>
          <Text style={styles.adSubtext}>Banner Ad - {AD_UNIT_ID.slice(-8)}</Text>
        </View>
      </View>
    );
  }

  // On native platforms, use the actual AdMob component
  // Note: This will only work in development builds, not in Expo Go
  try {
    const { BannerAd: GoogleBannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
    
    return (
      <View style={[styles.container, style]}>
        <GoogleBannerAd
          unitId={__DEV__ ? TestIds.BANNER : AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => console.log('Ad loaded')}
          onAdFailedToLoad={(error: any) => console.log('Ad failed to load', error)}
        />
      </View>
    );
  } catch (error) {
    // Fallback to placeholder if AdMob is not available (e.g., in Expo Go)
    return (
      <View style={[styles.container, style]}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adText}>Reklam Alanı</Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  adPlaceholder: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 60,
  },
  adText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  adSubtext: {
    color: '#cbd5e1',
    fontSize: 10,
    marginTop: 4,
  },
});

export default BannerAd;
