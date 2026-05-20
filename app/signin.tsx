import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Welcome</ThemedText>

      <View style={styles.buttons}>
        <Pressable style={[styles.socialButton, { borderColor: '#ddd' }]}>
          <IconSymbol name="globe" size={18} color="#000" />
          <ThemedText style={styles.socialText}> Sign in with Google</ThemedText>
        </Pressable>
        <Pressable style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
          <IconSymbol name="person.crop.circle.fill" size={18} color="#fff" />
          <ThemedText style={[styles.socialText, { color: '#fff' }]}> Sign in with Facebook</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="subtitle">Email</ThemedText>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" />

      <ThemedText type="subtitle">Password</ThemedText>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />

      <Link href="/(tabs)" asChild>
        <Pressable style={styles.signinButton}>
          <ThemedText style={{ color: '#128CFF' }}>Sign in</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, maxWidth: 500, alignSelf: 'center', width: '100%', justifyContent: 'center' },
  header: { fontSize: 32, marginBottom: 24, fontWeight: '700' },
  buttons: { gap: 12, marginBottom: 24 },
  socialButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 8, borderWidth: 1 },
  socialText: { marginLeft: 8, fontSize: 16 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 12, marginBottom: 16, fontSize: 16, width: '100%' },
  signinButton: { marginTop: 18, borderWidth: 1, borderColor: '#eee', padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#f5f5f5' },
});
