import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface Branch {
  id: string;
  name: string;
  company: string;
  city: string;
  district: string;
  address: string;
  phone: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (params.q) {
      setSearchQuery(params.q as string);
      fetchBranches(params.q as string, 1, true);
    } else {
      fetchBranches('', 1, true);
    }
  }, [params.q]);

  const fetchBranches = async (query: string, pageNum: number, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/branches`, {
        params: {
          search: query || undefined,
          page: pageNum,
          limit: 20,
        },
      });
      
      const newBranches = response.data.branches;
      setTotal(response.data.total);
      setHasMore(newBranches.length === 20);
      
      if (reset) {
        setBranches(newBranches);
      } else {
        setBranches(prev => [...prev, ...newBranches]);
      }
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    fetchBranches(searchQuery, 1, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBranches(searchQuery, 1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchBranches(searchQuery, page + 1, false);
    }
  };

  const renderBranchItem = useCallback(({ item }: { item: Branch }) => (
    <TouchableOpacity
      style={styles.branchCard}
      onPress={() => router.push(`/branch/${item.id}`)}
    >
      <View style={styles.branchHeader}>
        <View style={styles.companyBadge}>
          <Text style={styles.companyText}>{item.company || 'Kargo'}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#94a3b8" />
      </View>
      <Text style={styles.branchName}>{item.name}</Text>
      <View style={styles.branchInfo}>
        <Feather name="map-pin" size={14} color="#64748b" />
        <Text style={styles.branchLocation}>
          {item.city} / {item.district}
        </Text>
      </View>
      <View style={styles.branchInfo}>
        <Feather name="phone" size={14} color="#64748b" />
        <Text style={styles.branchPhone}>{item.phone || 'Telefon bilgisi yok'}</Text>
      </View>
    </TouchableOpacity>
  ), [router]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1e88e5" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Feather name="search" size={48} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>Şube Bulunamadı</Text>
        <Text style={styles.emptyText}>
          Arama kriterlerinize uygun şube bulunamadı.
          Farklı bir arama deneyin.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Search Box */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Şube adı, şehir veya adres ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              fetchBranches('', 1, true);
            }}>
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Feather name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {total} şube bulundu
        </Text>
      </View>

      {/* Ad Placeholder */}
      <View style={styles.adBanner}>
        <Text style={styles.adText}>Reklam Alanı</Text>
      </View>

      {/* Branch List */}
      <FlatList
        data={branches}
        renderItem={renderBranchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1e88e5']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    marginLeft: 10,
  },
  searchButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  adBanner: {
    backgroundColor: '#e2e8f0',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    minHeight: 50,
  },
  adText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  branchCard: {
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
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  companyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e88e5',
  },
  branchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  branchLocation: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  branchPhone: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
