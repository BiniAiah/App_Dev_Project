import React, { useState } from 'react';
import { FlatList, Image, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { deleteUser, getAllUsers, User } from '@/services/userService';
import { router, useFocusEffect } from 'expo-router';

const isRenderableAvatar = (value?: string | null) =>
  typeof value === 'string' && /^(https?:|file:|blob:|data:)/i.test(value);

const getAgeText = (item: User) => {
  if (item.birthday) {
    const birthDate = new Date(item.birthday);
    if (!Number.isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
      }

      return `Age · ${age}`;
    }
  }

  return `Age · ${item.age}`;
};

function UserCard({ item, onEdit }: { item: User; onEdit: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onEdit}>
      <Image 
        source={isRenderableAvatar(item.avatar) ? { uri: item.avatar } : require('@/assets/images/icon.png')} 
        style={styles.avatar} 
      />
      <View style={styles.cardText}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText>{getAgeText(item)}</ThemedText>
      </View>
    </Pressable>
  );
}

export default function HomeListScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Home screen</ThemedText>
      {loading ? <ThemedText style={styles.statusText}>Loading users...</ThemedText> : null}
      {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}
      {!loading && !errorMessage && users.length === 0 ? (
        <ThemedText style={styles.statusText}>No users found yet. Tap + to create one.</ThemedText>
      ) : null}
      <FlatList 
        data={users} 
        ListEmptyComponent={null}
        renderItem={({ item }) => (
          <UserCard
            item={item}
            onEdit={() => item.id && router.push({ pathname: '/edit-user', params: { id: item.id } })}
          />
        )}
        keyExtractor={(i) => i.id ?? `${i.username}-${i.name}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} />}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/edit-user')}>
        <IconSymbol name="plus" size={24} color="#fff" />
        <ThemedText style={styles.fabText}>Add</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, maxWidth: 800, alignSelf: 'center', width: '100%' },
  header: { fontSize: 24, marginBottom: 16, fontWeight: '700' },
  statusText: { marginBottom: 12, color: '#666', fontSize: 14 },
  errorText: { marginBottom: 12, color: '#D32F2F', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8, alignItems: 'center', backgroundColor: '#fff' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  cardText: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: '#128CFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 3px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
    }),
  },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
