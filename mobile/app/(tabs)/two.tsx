import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function SearchScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

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
      <View style={S.container}>
        <Text style={S.title}>Rechercher un trajet</Text>
        <Text style={S.subtitle}>Indiquez votre destination et votre date de voyage.</Text>

        <View style={S.form}>
          <View style={S.fieldLabel}>
            <MapPin size={14} color={C.primary} />
            <Text style={S.label}>Départ</Text>
          </View>
          <TextInput
            style={S.input}
            placeholder="Ex: Lomé"
            placeholderTextColor={C.foregroundMuted}
            value={departure}
            onChangeText={setDeparture}
          />

          <View style={[S.fieldLabel, { marginTop: 16 }]}>
            <MapPin size={14} color={C.primary} />
            <Text style={S.label}>Arrivée</Text>
          </View>
          <TextInput
            style={S.input}
            placeholder="Ex: Kara"
            placeholderTextColor={C.foregroundMuted}
            value={arrival}
            onChangeText={setArrival}
          />

          <View style={[S.fieldLabel, { marginTop: 16 }]}>
            <Calendar size={14} color={C.primary} />
            <Text style={S.label}>Date</Text>
          </View>
          <TextInput
            style={S.input}
            placeholder="AAAA-MM-JJ"
            placeholderTextColor={C.foregroundMuted}
            value={date}
            onChangeText={setDate}
          />

          <TouchableOpacity style={S.btn} onPress={handleSearch} activeOpacity={0.85}>
            <Search size={18} color="#fff" />
            <Text style={S.btnText}>Trouver des trajets</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 28 },
  title: { fontSize: 26, fontWeight: '900', color: C.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.foregroundMuted, fontWeight: '500', marginBottom: 28, lineHeight: 20 },
  form: { backgroundColor: C.surface, borderRadius: 24, padding: 20, gap: 4, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12 }, android: { elevation: 4 } }) },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: C.background, borderRadius: 12, height: 50, paddingHorizontal: 14, fontSize: 15, fontWeight: '600', color: C.text },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 14, height: 52, marginTop: 20 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
