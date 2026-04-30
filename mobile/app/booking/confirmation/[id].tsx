import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, Bus, MapPin, Clock, User, Hash, Home, Ticket } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import api from '@/src/lib/api';

interface Booking {
  id: string;
  seatNumber: number;
  status: string;
  passengerName: string | null;
  passengerPhone: string | null;
  qrCode: string | null;
  totalPrice: string;
  schedule: {
    departureTime: string;
    route: {
      departureStation: { city: string };
      arrivalStation: { city: string };
      company: { name: string };
    };
    bus: { plateNumber: string };
  };
}

export default function ConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then(r => setBooking(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const S = styles(C);

  if (loading) return (
    <View style={S.center}><ActivityIndicator size="large" color={C.primary} /></View>
  );

  if (!booking) return (
    <View style={S.center}><Text style={{ color: C.error }}>Réservation introuvable.</Text></View>
  );

  const deptTime = new Date(booking.schedule.departureTime).toLocaleString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        {/* Success header */}
        <View style={S.successHeader}>
          <View style={S.checkCircle}>
            <CheckCircle size={48} color={C.success} />
          </View>
          <Text style={S.successTitle}>Réservation confirmée !</Text>
          <Text style={S.successSub}>Votre billet a été enregistré avec succès.</Text>
        </View>

        {/* Ticket card */}
        <View style={S.ticket}>
          {/* Top */}
          <View style={S.ticketHeader}>
            <Bus size={18} color={C.primary} />
            <Text style={S.ticketCompany}>{booking.schedule.route.company.name}</Text>
            <View style={[S.statusBadge, booking.status === 'confirmed' && { backgroundColor: `${C.success}20` }]}>
              <Text style={[S.statusText, { color: C.success }]}>{booking.status.toUpperCase()}</Text>
            </View>
          </View>

          {/* Route */}
          <View style={S.routeRow}>
            <View style={S.routeCity}>
              <Text style={S.routeTime}>
                {new Date(booking.schedule.departureTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={S.routeCityName}>{booking.schedule.route.departureStation.city}</Text>
            </View>
            <View style={S.routeArrow}>
              <View style={S.routeLine} />
              <Bus size={16} color={C.primary} />
              <View style={S.routeLine} />
            </View>
            <View style={[S.routeCity, { alignItems: 'flex-end' }]}>
              <Text style={S.routeTime}>—</Text>
              <Text style={S.routeCityName}>{booking.schedule.route.arrivalStation.city}</Text>
            </View>
          </View>

          {/* Dashes separator */}
          <View style={S.dashes} />

          {/* Details grid */}
          <View style={S.detailsGrid}>
            {[
              { icon: User,  label: 'Passager', value: booking.passengerName || '—' },
              { icon: Hash,  label: 'Siège',    value: `N° ${booking.seatNumber}` },
              { icon: Clock, label: 'Départ',   value: deptTime },
              { icon: Bus,   label: 'Bus',      value: booking.schedule.bus.plateNumber },
            ].map(({ icon: Icon, label, value }) => (
              <View key={label} style={S.detailItem}>
                <Icon size={14} color={C.primary} />
                <View>
                  <Text style={S.detailLabel}>{label}</Text>
                  <Text style={S.detailValue}>{value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={S.priceRow}>
            <Text style={S.priceLabel}>Montant payé</Text>
            <Text style={[S.priceValue, { color: C.primary }]}>
              {parseInt(booking.totalPrice).toLocaleString('fr-FR')} F
            </Text>
          </View>

          {/* QR Code hint */}
          <View style={S.qrHint}>
            <Text style={S.qrHintText}>📱 Présentez ce billet au chauffeur pour embarquer.</Text>
            <Text style={S.bookingId}>Réf: {booking.id.split('-')[0].toUpperCase()}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={S.actions}>
          <TouchableOpacity style={S.btnPrimary} onPress={() => router.replace('/(tabs)/')} activeOpacity={0.85}>
            <Home size={18} color="#fff" />
            <Text style={S.btnPrimaryText}>Retour à l'accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.btnSecondary} onPress={() => router.replace('/(tabs)/bookings')} activeOpacity={0.85}>
            <Ticket size={18} color={C.primary} />
            <Text style={S.btnSecondaryText}>Mes réservations</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, gap: 20, paddingBottom: 40 },
  successHeader: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${C.success}15`, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 24, fontWeight: '900', color: C.text },
  successSub: { fontSize: 14, color: C.foregroundMuted, fontWeight: '500' },
  ticket: { backgroundColor: C.surface, borderRadius: 24, padding: 20, gap: 16, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16 }, android: { elevation: 5 } }) },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketCompany: { flex: 1, fontSize: 14, fontWeight: '800', color: C.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: `${C.foregroundMuted}15` },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeCity: { flex: 1 },
  routeTime: { fontSize: 26, fontWeight: '900', color: C.text },
  routeCityName: { fontSize: 11, fontWeight: '800', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
  routeArrow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeLine: { flex: 1, height: 1.5, backgroundColor: C.border },
  dashes: { borderTopWidth: 1.5, borderTopColor: C.border, borderStyle: 'dashed', opacity: 0.4 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '45%' },
  detailLabel: { fontSize: 10, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 13, fontWeight: '700', color: C.text, marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  priceLabel: { fontSize: 13, fontWeight: '700', color: C.foregroundMuted },
  priceValue: { fontSize: 22, fontWeight: '900' },
  qrHint: { backgroundColor: C.background, borderRadius: 12, padding: 12, gap: 4 },
  qrHintText: { fontSize: 12, color: C.foregroundMuted, fontWeight: '600', textAlign: 'center' },
  bookingId: { fontSize: 11, fontWeight: '800', color: C.foregroundMuted, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  actions: { gap: 10 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 16, height: 54 },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.surface, borderRadius: 16, height: 54, borderWidth: 1.5, borderColor: C.border },
  btnSecondaryText: { color: C.primary, fontWeight: '800', fontSize: 15 },
});
