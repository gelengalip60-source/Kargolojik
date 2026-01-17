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
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import BannerAd from '../../components/BannerAd';

// Backend adresi Render'dan gelecek, yoksa yerel çalışır
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

const COMPANY_COLORS: Record<string, string> = {
  'Aras Kargo': '#e74c3c',
  'PTT Kargo': '#f1c40f',
  'DHL Kargo': '#e67e22',
  'Sürat Kargo': '#3498db',
  'Inter Global Kargo': '#9b59b6',
  'Yurtiçi Kargo': '#2ecc71',
  'TNT Kargo': '#ff6b00',
  'UPS Kargo': '#6d1a36',
};

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchCompanies();
    if (params.q) {
      setSearchQuery(params.q as string);
      fetchBranches(params.q as string, '', 1, true);
    } else {
      fetchBranches('', '', 1, true);
    }
  }, [params.q]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/companies`);
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Şirketler yüklenemedi:', error);
    }
  };

  const fetchBranches = async (query: string, company: string, pageNum: number, reset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/branches`, {
        params: {
          q: query || undefined,      // Backend 'q' bekliyor
          company: company || undefined,
          page: pageNum,
          limit: 20,
        },
      });

      // Backend'den gelen (Sube_Adi vb.) veriyi (name vb.) formatına çeviriyoruz
      const formattedBranches = response.data.branches.map((b: any) => ({
        id: b.id,
        name: b.Sube_Adi,
        company: b.Sirket_Adi,
        city: b.Sehir,
        district: b.Ilce,
        address: b.Adres,
        phone: b.Telefon_1 || 'Telefon yok'
      }));

      setTotal(response.data.total);
      setHasMore(formattedBranches.length === 20);

      if (reset) {
        setBranches(formattedBranches);
      } else {
        setBranches(prev => [...prev, ...formattedBranches]);
      }
      setPage(pageNum);
    } catch (error) {
      console.error('Şubeler getirilirken hata oluştu:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    fetchBranches(searchQuery, selectedCompany, 1, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBranches(searchQuery, selectedCompany, 1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchBranches(searchQuery, selectedCompany, page + 1, false);
    }
  };

  const handleCompanyFilter = (company: string) => {
    setSelectedCompany(company);
    fetchBranches(searchQuery, company, 1, true);
  };

  const clearFilters = () => {
    setSelectedCompany('');
    setSearchQuery('');
    fetchBranches('', '', 1, true);
  };

  const getCompanyColor = (company: string) => {
    return COMPANY_COLORS[company] || '#1e88e5';
  };

  const renderBranchItem = useCallback(({ item }: { item: Branch }) => (
    <TouchableOpacity
      style={styles.branchCard}
      onPress={() => router.push(`/branch/${item.id}`)}
    >
      <View style={styles.branchHeader}>
        <View style={[styles.companyBadge, { backgroundColor: `${getCompanyColor(item.company)}20` }]}>
          <Text style={[styles.companyText, { color: getCompanyColor(item.company) }]}>
            {item.company}
          </Text>
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
        <Text style={styles.branchPhone}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  ), [router]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Arama Kutusu */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Şube, şehir veya ilçe ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              fetchBranches('', selectedCompany, 1, true);
            }}>
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Feather name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Şirket Filtreleri */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterPill, !selectedCompany && styles.filterPillActive]}
            onPress={() => handleCompanyFilter('')}
          >
            <Text style={[styles.filterPillText, !selectedCompany && styles.filterPillTextActive]}>
              Tümü
            </Text>
          </TouchableOpacity>
          {companies.map((company) => (
            <TouchableOpacity
              key={company}
              style={[
                styles.filterPill,
                selectedCompany === company && styles.filterPillActive
              ]}
              onPress={() => handleCompanyFilter(company)}
            >
              <View style={[styles.companyDot, { backgroundColor: getCompanyColor(company) }]} />
              <Text style={[
                styles.filterPillText,
                selectedCompany === company && styles.filterPillTextActive
              ]}>
                {company.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sonuç Sayısı */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {total.toLocaleString('tr-TR')} şube bulundu
        </Text>
        {(selectedCompany || searchQuery) && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      <BannerAd />

      <FlatList
        data={branches}
        renderItem={renderBranchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={() => (
          !loading && (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Sonuç Yok</Text>
            </View>
          )
        )}
        ListFooterComponent={() => loading && <ActivityIndicator style={{ margin: 20 }} color="#1e88e5" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  searchContainer: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#1e293b', marginLeft: 8 },
  searchButton: { backgroundColor: '#1e88e5', borderRadius: 10, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  filterContainer: { backgroundColor: '#fff', paddingVertical: 10, paddingLeft: 16 },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
  filterPillActive: { borderColor: '#1e88e5', backgroundColor: '#e0f2fe' },
  filterPillText: { fontSize: 13, color: '#64748b' },
  filterPillTextActive: { color: '#1e88e5', fontWeight: 'bold' },
  companyDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  resultsCount: { fontSize: 14, color: '#64748b' },
  clearFilters: { fontSize: 14, color: '#ef4444', fontWeight: 'bold' },
  listContainer: { padding: 16 },
  branchCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  branchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  companyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  companyText: { fontSize: 12, fontWeight: 'bold' },
  branchName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  branchInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  branchLocation: { fontSize: 13, color: '#64748b', marginLeft: 6 },
  branchPhone: { fontSize: 13, color: '#64748b', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyTitle: { fontSize: 16, color: '#94a3b8', marginTop: 10 }
});