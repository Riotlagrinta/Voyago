import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Platform, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Bus, Lock, Users, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import api from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

interface Seat {
  id: string;
  seatNumber: number;
  type: string;
  status: 'available' | 'occupied' | 'locked';
}
interface Schedule {
  id: string;
  departureTime: string;
  price: string;
  route: {
    departureStation: { city: string };
    arrivalStation: { city: string };
  };
  bus: { plateNumber: string };
  company: { name: string };
}

export default function BookingScreen() {
  const { scheduleId } = useLocalSearchParams<{ scheduleId: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const { user, isAuthenticated } = useAuthStore();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Seat[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [passengers, setPassengers] = useState<{ name: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }
    const load = async () => {
      try {
        const [sRes, seatsRes] = await Promise.all([
          api.get(`/schedules/${scheduleId}`),
          api.get(`/schedules/${scheduleId}/seats`),
        ]);
        setSchedule(sRes.data.data);
        setSeats(seatsRes.data.data ?? []);
      } catch {
        setError('Erreur de chargement.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scheduleId]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'available') return;
    const already = selected.find(s => s.id === seat.id);
    if (already) {
      setSelected(selected.filter(s => s.id !== seat.id));
    } else {
      if (selected.length >= 5) { setError('Maximum 5 sièges.'); return; }
      setSelected([...selected, seat]);
    }
    setError(null);
  };

  const goToStep2 = () => {
    if (selected.length === 0) { setError('Choisissez au moins un siège.'); return; }
    setPassengers(selected.map((_, i) => ({
      name: i === 0 ? (user?.name ?? '') : '',
      phone: i === 0 ? (user?.phone ?? '') : '',
    })));
    setStep(2);
  };

  const updatePassenger = (i: number, field: 'name' | 'phone', val: string) => {
    const p = [...passengers];
    p[i][field] = val;
    setPassengers(p);
  };

  const handleBook = async () => {
    if (passengers.some(p => !p.name || !p.phone)) {
      setError('Remplissez tous les champs passagers.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/bookings', {
        scheduleId: schedule!.id,
        seats: selected.map((seat, i) => ({
          seatId: seat.id,
          passengerName: passengers[i].name,
          passengerPhone: passengers[i].phone,
        })),
      });
      const bookings = res.data.data;
      if (bookings?.length > 0) {
        router.push(`/booking/confirmation/${bookings[0].id}`);
      }
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(msg || 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const S = styles(C);
  const total = schedule ? parseInt(schedule.price) * selected.length : 0;

  if (loading) return (
    <View style={S.center}>
      <ActivityIndicator size="large" color={C.primary} />
    </View>
  );

  if (!schedule) return (
    <View style={S.center}>
      <Text style={{ color: C.error }}>Trajet introuvable.</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={S.backBtn}>
          <ChevronLeft size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{step === 1 ? 'Choisir les sièges' : 'Informations passagers'}</Text>
        {/* Steps */}
        <View style={S.steps}>
          {[1, 2].map(n => (
            <View key={n} style={[S.stepDot, step >= n && { backgroundColor: C.primary }]}>
              <Text style={[S.stepNum, step >= n && { color: '#fff' }]}>{n}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        {/* Schedule summary */}
        <View style={S.summaryCard}>
          <Bus size={18} color={C.primary} />
          <View style={{ flex: 1 }}>
            <Text style={S.summaryRoute}>
              {schedule.route.departureStation.city} → {schedule.route.arrivalStation.city}
            </Text>
            <Text style={S.summaryMeta}>
              {schedule.company.name} · {new Date(schedule.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={[S.summaryPrice, { color: C.primary }]}>
            {parseInt(schedule.price).toLocaleString('fr-FR')} F
          </Text>
        </View>

        {step === 1 && (
          <View style={S.seatSection}>
            <Text style={S.sectionTitle}>Plan du bus ({selected.length} sélectionné{selected.length > 1 ? 's' : ''})</Text>
            <View style={S.seatGrid}>
              {seats.map(seat => {
                const isSelected = !!selected.find(s => s.id === seat.id);
                return (
                  <TouchableOpacity
                    key={seat.id}
                    style={[
                      S.seat,
                      seat.status === 'occupied' && S.seatOccupied,
                      isSelected && S.seatSelected,
                    ]}
                    onPress={() => toggleSeat(seat)}
                    disabled={seat.status !== 'available'}
                  >
                    {seat.status === 'occupied'
                      ? <Lock size={12} color={C.foregroundMuted} />
                      : <Text style={[S.seatNum, isSelected && { color: '#fff' }]}>{seat.seatNumber}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* Legend */}
            <View style={S.legend}>
              {[
                { color: C.surface, border: C.border, label: 'Libre' },
                { color: C.primary, border: C.primary, label: 'Sélectionné' },
                { color: C.background, border: C.border, label: 'Occupé' },
              ].map(({ color, border, label }) => (
                <View key={label} style={S.legendItem}>
                  <View style={[S.legendDot, { backgroundColor: color, borderColor: border }]} />
                  <Text style={S.legendText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 2 && passengers.map((p, i) => (
          <View key={i} style={S.passengerCard}>
            <Text style={S.passengerTitle}>Passager {i + 1} — Siège {selected[i]?.seatNumber}</Text>
            <View style={S.fieldGroup}>
              <Text style={S.fieldLabel}>Nom complet</Text>
              <TextInput
                style={S.fieldInput}
                value={p.name}
                onChangeText={v => updatePassenger(i, 'name', v)}
                placeholder="Ex: Koffi Mensah"
                placeholderTextColor={C.foregroundMuted}
              />
            </View>
            <View style={S.fieldGroup}>
              <Text style={S.fieldLabel}>Téléphone</Text>
              <TextInput
                style={S.fieldInput}
                value={p.phone}
                onChangeText={v => updatePassenger(i, 'phone', v)}
                placeholder="Ex: 90123456"
                placeholderTextColor={C.foregroundMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ))}

        {error && (
          <View style={S.errorBox}>
            <AlertCircle size={14} color={C.error} />
            <Text style={S.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={S.bottomBar}>
        <View>
          <Text style={S.totalLabel}>Total</Text>
          <Text style={[S.totalPrice, { color: C.primary }]}>{total.toLocaleString('fr-FR')} F</Text>
        </View>
        <TouchableOpacity
          style={[S.ctaBtn, (submitting || (step === 1 && selected.length === 0)) && S.ctaDisabled]}
          onPress={step === 1 ? goToStep2 : handleBook}
          disabled={submitting || (step === 1 && selected.length === 0)}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={S.ctaBtnText}>{step === 1 ? 'Continuer' : 'Réserver maintenant'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: C.text },
  steps: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.background, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, fontWeight: '800', color: C.foregroundMuted },
  scroll: { padding: 16, gap: 16, paddingBottom: 120 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 14, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  summaryRoute: { fontSize: 14, fontWeight: '800', color: C.text },
  summaryMeta: { fontSize: 12, color: C.foregroundMuted, fontWeight: '500', marginTop: 2 },
  summaryPrice: { fontSize: 16, fontWeight: '900' },
  seatSection: { backgroundColor: C.surface, borderRadius: 20, padding: 16, gap: 16, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  seatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  seat: { width: 44, height: 44, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  seatOccupied: { backgroundColor: C.background, borderColor: 'transparent' },
  seatSelected: { backgroundColor: C.primary, borderColor: C.primary },
  seatNum: { fontSize: 12, fontWeight: '700', color: C.text },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 1.5 },
  legendText: { fontSize: 11, fontWeight: '600', color: C.foregroundMuted },
  passengerCard: { backgroundColor: C.surface, borderRadius: 20, padding: 16, gap: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  passengerTitle: { fontSize: 14, fontWeight: '800', color: C.text },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { backgroundColor: C.background, borderRadius: 12, height: 48, paddingHorizontal: 14, fontSize: 14, fontWeight: '600', color: C.text },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12 },
  errorText: { fontSize: 13, color: C.error, fontWeight: '600', flex: 1 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  totalLabel: { fontSize: 11, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase' },
  totalPrice: { fontSize: 22, fontWeight: '900' },
  ctaBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  ctaDisabled: { opacity: 0.5 },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
