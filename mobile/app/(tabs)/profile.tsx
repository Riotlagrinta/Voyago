import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, LogOut, ChevronRight, Shield, Ticket, Settings } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const S = styles(C);

  if (!isAuthenticated) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <View style={S.center}>
        <View style={S.avatarBox}>
          <User size={32} color={C.foregroundMuted} />
        </View>
        <Text style={S.guestTitle}>Vous n'êtes pas connecté</Text>
        <Text style={S.guestSub}>Connectez-vous pour accéder à votre profil.</Text>
        <TouchableOpacity style={S.loginBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={S.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={S.registerLink}>Pas encore de compte ? Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <View style={S.scroll}>
        {/* Avatar */}
        <View style={S.avatarSection}>
          <View style={S.avatarLarge}>
            <Text style={S.avatarInitial}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={S.userName}>{user?.name}</Text>
          <View style={S.roleBadge}>
            <Text style={S.roleText}>{user?.role === 'passenger' ? 'Passager' : user?.role}</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={S.card}>
          {[
            { icon: Mail,  label: 'Email',     value: user?.email },
            { icon: Phone, label: 'Téléphone', value: user?.phone || 'Non renseigné' },
          ].map(({ icon: Icon, label, value }) => (
            <View key={label} style={S.infoRow}>
              <Icon size={16} color={C.primary} />
              <View style={{ flex: 1 }}>
                <Text style={S.infoLabel}>{label}</Text>
                <Text style={S.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={S.menu}>
          {[
            { icon: Ticket,   label: 'Mes réservations', onPress: () => router.push('/(tabs)/bookings') },
            { icon: Shield,   label: 'Sécurité & mot de passe', onPress: () => {} },
            { icon: Settings, label: 'Paramètres', onPress: () => {} },
          ].map(({ icon: Icon, label, onPress }) => (
            <TouchableOpacity key={label} style={S.menuItem} onPress={onPress} activeOpacity={0.7}>
              <View style={S.menuIcon}>
                <Icon size={18} color={C.primary} />
              </View>
              <Text style={S.menuLabel}>{label}</Text>
              <ChevronRight size={16} color={C.foregroundMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={S.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={18} color={C.error} />
          <Text style={S.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.light) => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.border },
  guestTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  guestSub: { fontSize: 14, color: C.foregroundMuted, textAlign: 'center' },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 13, borderRadius: 14, backgroundColor: C.primary, marginTop: 8 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  registerLink: { fontSize: 13, color: C.primary, fontWeight: '600', marginTop: 4 },
  scroll: { flex: 1, padding: 20, gap: 16 },
  avatarSection: { alignItems: 'center', gap: 8, paddingBottom: 8 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 30, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '900', color: C.text },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: `${C.primary}15` },
  roleText: { fontSize: 11, fontWeight: '800', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: C.surface, borderRadius: 20, padding: 16, gap: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: C.foregroundMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 2 },
  menu: { backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: C.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: `${C.error}10`, borderRadius: 16, height: 52, borderWidth: 1.5, borderColor: `${C.error}30`, marginTop: 4 },
  logoutText: { color: C.error, fontWeight: '800', fontSize: 15 },
});
