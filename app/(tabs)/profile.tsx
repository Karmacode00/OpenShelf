// app/(tabs)/profile.tsx (o donde tengas tu pantalla)
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const s = getStyles(C);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Perfil</Text>

        <View>
          <View style={s.avatarWrap}>
            <View style={s.avatarCircle}>
              <Ionicons name="person" size={56} color={C.textContrast} />
            </View>
          </View>

          <Text style={s.name}>{user?.displayName || 'Estudiante Lector'}</Text>
          <Text style={s.email}>{user?.email || 'estudiante@gmail.com'}</Text>
        </View>

        <Card style={s.cardBlock}>
          <View style={s.itemRow}>
            <View style={s.itemLeft}>
              <Ionicons
                name="bag-handle"
                size={22}
                color={C.textContrast}
                style={{ marginRight: 12 }}
              />
              <View>
                <Text style={s.itemTitle}>Mis Préstamos</Text>
                <Text style={s.itemSub}>Información de los libros que te prestaron</Text>
              </View>
            </View>
            <TouchableOpacity style={s.chevronBtn} onPress={() => router.push('/loans')}>
              <Ionicons name="chevron-forward" size={22} color={C.textContrast} />
            </TouchableOpacity>
          </View>

          <View style={[s.itemRow, { marginTop: 18 }]}>
            <View style={s.itemLeft}>
              <Ionicons name="book" size={22} color={C.textContrast} style={{ marginRight: 12 }} />
              <View>
                <Text style={s.itemTitle}>Mis libros</Text>
                <Text style={s.itemSub}>Detalles de tus libros</Text>
              </View>
            </View>
            <TouchableOpacity style={s.chevronBtn} onPress={() => router.push('/home')}>
              <Ionicons name="chevron-forward" size={22} color={C.textContrast} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Botón cerrar sesión */}
        <View style={{ marginTop: 24 }}>
          <Button label="Cerrar sesión" variant="primary" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (C: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingBottom: 32,
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: C.title,
      textAlign: 'center',
    },
    avatarWrap: { alignItems: 'center', marginBottom: 10 },
    avatarCircle: {
      width: 112,
      height: 112,
      borderRadius: 56,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.buttonSecondary,
    },
    name: {
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '700',
      color: C.textDark,
      marginTop: 12,
    },
    email: {
      textAlign: 'center',
      color: C.textDark,
      marginTop: 4,
      marginBottom: 20,
    },
    cardBlock: {
      borderRadius: 15,
      padding: 16,
      backgroundColor: C.card,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    itemTitle: {
      color: C.textContrast,
      fontWeight: '700',
      fontSize: 16,
      marginBottom: 2,
    },
    itemSub: {
      color: C.textContrast,
      opacity: 0.85,
      fontSize: 12,
      flexShrink: 1,
    },
    chevronBtn: {
      backgroundColor: C.accent,
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
  });
