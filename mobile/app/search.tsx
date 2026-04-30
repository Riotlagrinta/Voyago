import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bus, Clock, Users, ArrowRight, ChevronLeft, Search, Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import api from '@/src/lib/api';

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  price: string;
  availableSeats: number;
  route: {
    departureStation: { city: string };
    arrivalStation: { city: string };
    durationMin: number | null;
  };
  bus: { type: string; plateNumber: string };
  company: { name: string; certified: boolean };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(min: number | null) {
  if (!min) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? `${m}` : ''}` : `${m}min`;
}

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ departure?: string; arrival?: string; date?: string }>();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'time' | 'price'>('time');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/schedules', {
          params: {
            ...(params.departure && { departure: params.departure }),
            ...(params.arrival   && { arrival: params.arrival }),
            ...(params.date      && { date: params.date }),
          },
        });
        setSchedules(res.data.data ?? []);
      } catch {
        setError('Impossible de charger les trajets.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [params.departure, params.arrival, params.date]);

  const sorted = [...schedules].sort((a, b) =>
    sort === 'price'
      ? parseInt(a.price) - parseInt(b.price)
      : new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );

  const S = styles(C);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <ChevronLeft size={22} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={S.headerTitle}>
            {params.departure && params.arrival
              ? `${params.departure} → ${params.arrival}`
              : 'Résultats'}
          </Text>
          {params.date && <Text style={S.headerSub}>{params.date}</Text>}
        </View>
      </View>

      {/* Sort pills */}
      {!loading && sorted.length > 0 && (
        <View style={S.sortRow}>
          {(['time', 'price'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[S.sortPill, sort === s && S.sortPillActive]}
              onPress={() => setSort(s)}
            >
              <Text style={[S.sortPillText, sort === s && S.sortPillTextActive]}>
                {s === 'time' ? 'Le plus tôt' : 'Le moins cher'}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={S.countText}>{sorted.length} trajet{sorted.length > 1 ? 's' : ''}</Text>
        </View>
      )}

      {loading ? (
        <View style={S.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={S.loadingText}>Recherche en cours…</Text>
        </View>
      ) : error ? (
        <View style={S.center}>
          <Text style={S.errorText}>{error}</Text>
        </View>
      ) : sorted.length === 0 ? (
        <View style={S.center}>
          <Bus size={48} color={C.border} />
          <Text style={S.emptyTitle}>Aucun trajet disponible</Text>
          <Text style={S.emptyText}>Essayez d'autres villes ou une autre date.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={S.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={S.card}
              activeOpacity={0.88}
              onPress={() => router.push(`/booking/${item.id}`)}
            >
              {/* Top row */}
              <View style={S.cardTop}>
                <View style={S.busTypePill}>
                  <Bus size={12} color={C.primary} />
                  <Text style={S.busTypeText}>{item.bus.type.toUpperCase()}</Text>
                </View>
                <Text style={S.plateText}>{item.bus.plateNumber}</Text>
                {item.company.certified && (
                  <View style={S.certBadge}>
                    <Shield size={11} color="#3B82F6" />
                    <Text style={S.certText}>Certifié</Text>
                  </View>
                )}
              </View>

              {/* Route timeline */}
              <View style={S.timeline}>
                <View style={S.timeBlock}>
                  <Text style={S.timeText}>{formatTime(item.departureTime)}</Text>
                  <Text style={S.cityText}>{item.route.departureStation.city}</Text>
                </View>
                <View style={S.timelineLine}>
                  <View style={S.dot} />
                  <View style={S.line} />
                  <Bus size={14} color={C.primary} />
                  <View style={S.line} />
                  <View style={S.dot} />
                </View>
                <View style={[S.timeBlock, { alignItems: 'flex-end' }]}>
                  <Text style={S.timeText}>
                    {item.arrivalTime
                      ? formatTime(item.arrivalTime)
                      : item.route.durationMin
                        ? formatTime(new Date(new Date(item.departureTime).getTime() + item.route.durationMin * 60000).toISOString())
                        : '—'}
                  </Text>
                  <Text style={S.cityText}>{item.route.arrivalStation.city}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={S.cardFooter}>
                <View style={S.metaRow}>
                  <View style={S.metaItem}>
                    <Clock size={12} color={C.primary} />
                    <Text style={S.metaText}>{formatDuration(item.route.durationMin)}</Text>
                  </View>
                  <View style={S.metaItem}>
                    <Users size={12} color={item.availableSeats <= 5 ? C.warning : C.foregroundMuted} />
                    <Text style={[S.metaText, item.availableSeats <= 5 && { color: C.warning }]}>
                      {item.availableSeats <= 5 ? `+que ${item.availableSeats}!` : `${item.availableSeats} places`}
                    </Text>
                  </View>
                  <Text style={S.companyText}>{item.company.name}</Text>
                </View>
                <View style={S.priceRow}>
                  <View>
                    <Text style={S.priceLabel}>Prix/siège</Text>
                    <Text style={[S.price, { color: C.primary }]}>
                      {parseInt(item.price).toLocaleString('fr-FR')} F
                    </Text>
                  </View>
                  <View style={S.reserveBtn}>
                    <Text style={S.reserveText}>Réserver</Text>
                    <ArrowRight size={14} color="#fff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.foregroundMuted, fontWeight: '600', marginTop: 2 },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  sortPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border },
  sortPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  sortPillText: { fontSize: 12, fontWeight: '700', color: C.foregroundMuted },
  sortPillTextActive: { color: '#fff' },
  countText: { marginLeft: 'auto', fontSize: 12, fontWeight: '700', color: C.foregroundMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  loadingText: { fontSize: 14, color: C.foregroundMuted, fontWeight: '600' },
  errorText: { fontSize: 14, color: C.error, fontWeight: '600', textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  emptyText: { fontSize: 13, color: C.foregroundMuted, textAlign: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: { backgroundColor: C.surface, borderRadius: 20, padding: 16, gap: 14, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10 }, android: { elevation: 3 } }) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  busTypePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${C.primary}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  busTypeText: { fontSize: 10, fontWeight: '800', color: C.primary, letterSpacing: 0.5 },
  plateText: { fontSize: 10, fontWeight: '700', color: C.foregroundMuted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  certBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto', backgroundColor: '#EFF6FF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  certText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },
  timeline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBlock: { flex: 1 },
  timeText: { fontSize: 24, fontWeight: '900', color: C.text },
  cityText: { fontSize: 10, fontWeight: '800', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  timelineLine: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.border },
  line: { flex: 1, height: 1.5, backgroundColor: C.border },
  cardFooter: { gap: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 11, fontWeight: '700', color: C.foregroundMuted },
  companyText: { marginLeft: 'auto', fontSize: 11, fontWeight: '700', color: C.foregroundMuted, fontStyle: 'italic' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { fontSize: 10, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontSize: 22, fontWeight: '900' },
  reserveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  reserveText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
