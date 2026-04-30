import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bus, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import api from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const setAuth = useAuthStore(s => s.setAuth);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      await setAuth(user, token);
      router.replace('/(tabs)/');
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(msg || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const S = styles(C);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <TouchableOpacity style={S.logoRow} onPress={() => router.replace('/(tabs)/')}>
            <View style={S.logoBox}><Bus size={22} color="#fff" /></View>
            <Text style={S.logoText}>Voyago</Text>
          </TouchableOpacity>

          <Text style={S.title}>Bon retour !</Text>
          <Text style={S.sub}>Connectez-vous pour accéder à votre compte.</Text>

          {error && (
            <View style={S.errorBox}>
              <AlertCircle size={14} color={C.error} />
              <Text style={S.errorText}>{error}</Text>
            </View>
          )}

          <View style={S.form}>
            <View style={S.fieldGroup}>
              <Text style={S.label}>Email</Text>
              <View style={S.inputRow}>
                <Mail size={16} color={C.primary} />
                <TextInput
                  style={S.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor={C.foregroundMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={S.fieldGroup}>
              <Text style={S.label}>Mot de passe</Text>
              <View style={S.inputRow}>
                <Lock size={16} color={C.primary} />
                <TextInput
                  style={S.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={C.foregroundMuted}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[S.btn, loading && S.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={S.btnText}>Se connecter</Text>
                    <ArrowRight size={18} color="#fff" />
                  </>}
            </TouchableOpacity>
          </View>

          <View style={S.footer}>
            <Text style={S.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={S.footerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36 },
  logoBox: { backgroundColor: C.primary, borderRadius: 12, padding: 8 },
  logoText: { fontSize: 24, fontWeight: '900', color: C.text },
  title: { fontSize: 28, fontWeight: '900', color: C.text, marginBottom: 6 },
  sub: { fontSize: 14, color: C.foregroundMuted, fontWeight: '500', marginBottom: 24 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: C.error, fontWeight: '600', flex: 1 },
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 12, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, height: 52, borderWidth: 1.5, borderColor: C.border },
  input: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 16, height: 54, marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 14, color: C.foregroundMuted, fontWeight: '500' },
  footerLink: { fontSize: 14, color: C.primary, fontWeight: '800' },
});
