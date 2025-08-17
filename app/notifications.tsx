import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';

import { Colors } from '@constants/Colors';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const load = async () => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, [user?.uid]);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'users', user!.uid, 'notifications', id), { unread: false });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.buttonSecondary,
              overflow: 'hidden',
            }}
          >
            <Ionicons name="chevron-back" size={22} color={C.buttonSecondaryText} />
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.title }}>Notificaciones</Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => markRead(item.id)}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: item.unread ? '#E8F3F5' : '#F6FBFC',
              }}
            >
              <Text style={{ fontWeight: '700' }}>{item.title}</Text>
              <Text>{item.body}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 24 }}>No tienes notificaciones.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20, gap: 12 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingVertical: 16, gap: 12 },
  emptyText: { textAlign: 'center', marginTop: 24 },
});
