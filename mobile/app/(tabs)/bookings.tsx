import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ticket, Bus, ChevronRight, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import api from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

interface Booking {
  id: string;
  seatNumber: number;
  status: string;
  totalPrice: string;
  createdAt: string;
  schedule: {
    departureTime: string;
    route: {
      departureStation: { city: string };
      arrivalStation: { city: string };
      company: { name: string };
    };
  };
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#10B981',
  pending:   '#F59E0B',
  cancelled: '#EF4444',
  completed: '#6B7280',
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmé',
  pending:   'En attente',
  cancelled: 'Annulé',
  completed: 'Terminé',
};

export default function BookingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const { isAuthenticated } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data ?? []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    const isPast = new Date(b.schedule.departureTime) < new Date();
    return filter === 'upcoming' ? !isPast : isPast;
  });

  const S = styles(C);

  if (!isAuthenticated) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <View style={S.center}>
        <Ticket size={48} color={C.border} />
        <Text style={S.emptyTitle}>Connectez-vous pour voir vos billets</Text>
        <TouchableOpacity style={S.loginBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={S.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <View style={S.headerBar}>
        <Text style={S.pageTitle}>Mes billets</Text>
      </View>

      {/* Filter pills */}
      <View style={S.filterRow}>
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[S.filterPill, filter === f && S.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[S.filterText, filter === f && S.filterTextActive]}>
              {f === 'all' ? 'Tous' : f === 'upcoming' ? 'À venir' : 'Passés'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={S.center}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : filtered.length === 0 ? (
        <View style={S.center}>
          <Ticket size={48} color={C.border} />
          <Text style={S.emptyTitle}>Aucune réservation</Text>
          <TouchableOpacity style={S.searchBtn} onPress={() => router.push('/(tabs)/two')}>
            <Text style={S.searchBtnText}>Trouver un trajet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={b => b.id}
          contentContainerStyle={S.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
          renderItem={({ item }) => {
            const statusColor = STATUS_COLORS[item.status] ?? C.foregroundMuted;
            const dept = new Date(item.schedule.departureTime);
            return (
              <TouchableOpacity
                style={S.card}
                activeOpacity={0.88}
                onPress={() => router.push(`/booking/confirmation/${item.id}`)}
              >
                <View style={S.cardTop}>
                  <View style={S.cardIconBox}>
                    <Bus size={18} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={S.routeText}>
                      {item.schedule.route.departureStation.city} → {item.schedule.route.arrivalStation.city}
                    </Text>
                    <Text style={S.companyText}>{item.schedule.route.company.name}</Text>
                  </View>
                  <View style={[S.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <Text style={[S.statusText, { color: statusColor }]}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </Text>
                  </View>
                </View>
                <View style={S.cardBottom}>
                  <View style={S.metaItem}>
                    <Clock size={12} color={C.foregroundMuted} />
                    <Text style={S.metaText}>
                      {dept.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}
                      {dept.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={S.seatText}>Siège {item.seatNumber}</Text>
                  <Text style={[S.price, { color: C.primary }]}>
                    {parseInt(item.totalPrice).toLocaleString('fr-FR')} F
                  </Text>
                  <ChevronRight size={16} color={C.foregroundMuted} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  headerBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 26, fontWeight: '900', color: C.text },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border },
  filterPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 13, fontWeight: '700', color: C.foregroundMuted },
  filterTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.text, textAlign: 'center' },
  loginBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, backgroundColor: C.primary },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  searchBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.primary },
  searchBtnText: { color: C.primary, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { backgroundColor: C.surface, borderRadius: 18, padding: 14, gap: 10, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' },
  routeText: { fontSize: 14, fontWeight: '800', color: C.text },
  companyText: { fontSize: 12, color: C.foregroundMuted, fontWeight: '500', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 11, color: C.foregroundMuted, fontWeight: '600' },
  seatText: { fontSize: 11, fontWeight: '700', color: C.foregroundMuted },
  price: { fontSize: 14, fontWeight: '900', marginLeft: 'auto' },
});
