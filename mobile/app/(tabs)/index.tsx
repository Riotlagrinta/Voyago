import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bus, MapPin, Calendar, Search, Shield, Clock, CreditCard } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const { user, isAuthenticated } = useAuthStore();

  const [departure, setDeparture] = useState('');
  const [arrival, setArrival]     = useState('');
  const [date, setDate]           = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (departure) params.set('departure', departure);
    if (arrival)   params.set('arrival', arrival);
    if (date)      params.set('date', date);
    router.push(`/search?${params.toString()}`);
  };

  const S = styles(C);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={S.header}>
          <View style={S.logoRow}>
            <View style={S.logoBox}>
              <Bus color="#fff" size={20} />
            </View>
            <Text style={S.logoText}>Voyago</Text>
          </View>
          {isAuthenticated ? (
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <View style={S.avatarBox}>
                <Text style={S.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={S.loginBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={S.loginBtnText}>Connexion</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero */}
        <View style={S.hero}>
          <Text style={S.heroTag}>🇹🇬 Transport réinventé au Togo</Text>
          <Text style={S.heroTitle}>Voyagez{'\n'}<Text style={{ color: C.primary }}>sans limites.</Text></Text>
          <Text style={S.heroSub}>Réservez vos places de bus avec suivi GPS en temps réel.</Text>
        </View>

        {/* Search Card */}
        <View style={S.card}>
          <Text style={S.cardTitle}>Trouver un trajet</Text>

          <View style={S.inputRow}>
            <MapPin size={16} color={C.primary} style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="Ville de départ"
              placeholderTextColor={C.foregroundMuted}
              value={departure}
              onChangeText={setDeparture}
            />
          </View>

          <View style={S.inputRow}>
            <MapPin size={16} color={C.primary} style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="Ville d'arrivée"
              placeholderTextColor={C.foregroundMuted}
              value={arrival}
              onChangeText={setArrival}
            />
          </View>

          <View style={S.inputRow}>
            <Calendar size={16} color={C.primary} style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="Date (AAAA-MM-JJ)"
              placeholderTextColor={C.foregroundMuted}
              value={date}
              onChangeText={setDate}
            />
          </View>

          <TouchableOpacity style={S.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
            <Search size={18} color="#fff" />
            <Text style={S.searchBtnText}>Rechercher</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={S.features}>
          {[
            { icon: Shield, title: 'Sécurité', desc: 'Chauffeurs certifiés et bus géolocalisés.' },
            { icon: Clock,  title: 'Temps réel', desc: 'Suivez votre bus en direct via GPS.' },
            { icon: CreditCard, title: 'Mobile Money', desc: 'Payez via T-Money ou Flooz.' },
          ].map(({ icon: Icon, title, desc }) => (
            <View key={title} style={S.featureCard}>
              <View style={S.featureIcon}>
                <Icon size={20} color={C.primary} />
              </View>
              <Text style={S.featureTitle}>{title}</Text>
              <Text style={S.featureDesc}>{desc}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={S.stats}>
          <View style={S.statItem}>
            <Text style={[S.statNum, { color: C.primary }]}>50K+</Text>
            <Text style={S.statLabel}>Passagers</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={[S.statNum, { color: C.primary }]}>120</Text>
            <Text style={S.statLabel}>Bus en service</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { backgroundColor: C.primary, borderRadius: 10, padding: 6 },
  logoText: { fontSize: 20, fontWeight: '800', color: C.text },
  avatarBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  loginBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: C.primary },
  loginBtnText: { color: C.primary, fontWeight: '700', fontSize: 13 },
  hero: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  heroTag: { fontSize: 12, fontWeight: '700', color: C.primary, marginBottom: 10 },
  heroTitle: { fontSize: 38, fontWeight: '900', color: C.text, lineHeight: 44, marginBottom: 12 },
  heroSub: { fontSize: 15, color: C.foregroundMuted, fontWeight: '500', lineHeight: 22 },
  card: { marginHorizontal: 16, backgroundColor: C.surface, borderRadius: 24, padding: 20, gap: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12 }, android: { elevation: 4 } }) },
  cardTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, borderRadius: 12, paddingHorizontal: 12, height: 48 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 14, height: 50, marginTop: 4 },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  features: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 32, gap: 12 },
  featureCard: { flex: 1, minWidth: 100, backgroundColor: C.surface, borderRadius: 20, padding: 16, alignItems: 'center', gap: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  featureIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 13, fontWeight: '800', color: C.text, textAlign: 'center' },
  featureDesc: { fontSize: 11, color: C.foregroundMuted, textAlign: 'center', lineHeight: 16 },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, marginHorizontal: 16, backgroundColor: C.surface, borderRadius: 20, padding: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 30, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: C.border },
});
