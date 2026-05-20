import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { addUser, deleteUser, getUserById, updateUser, uploadUserAvatar } from '@/services/userService';
import { router, useLocalSearchParams } from 'expo-router';

const DEFAULT_AVATAR = require('@/assets/images/icon.png');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const isRenderableAvatar = (value?: string | null) =>
  typeof value === 'string' && /^(https?:|file:|blob:|data:)/i.test(value);

function WebBirthdayPicker({ date, onDateChange }: { date: Date; onDateChange: (date: Date) => void }) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(String(date.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(date.getMonth()));
  const [selectedDay, setSelectedDay] = useState(String(date.getDate()));

  useEffect(() => {
    setSelectedYear(String(date.getFullYear()));
    setSelectedMonth(String(date.getMonth()));
    setSelectedDay(String(date.getDate()));
  }, [date]);

  const years = Array.from({ length: 100 }, (_, index) => String(today.getFullYear() - index));
  const monthOptions = MONTHS;
  const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1));

  const yearNumber = Number(selectedYear);
  const monthNumber = Number(selectedMonth);
  const dayNumber = Number(selectedDay);

  useEffect(() => {
    const maxDay = new Date(yearNumber, monthNumber + 1, 0).getDate();
    const safeDay = Math.min(dayNumber, maxDay);

    if (dayNumber !== safeDay) {
      setSelectedDay(String(safeDay));
      onDateChange(new Date(yearNumber, monthNumber, safeDay));
      return;
    }

    onDateChange(new Date(yearNumber, monthNumber, safeDay));
  }, [yearNumber, monthNumber, dayNumber, onDateChange]);

  return (
    <View style={styles.dropdownPickerContainer}>
      <View style={styles.dropdownCard}>
        <View style={styles.dropdownField}>
          <ThemedText style={styles.dropdownLabel}>Year</ThemedText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(value) => setSelectedYear(String(value))}
              style={styles.picker}
            >
              {years.map((year) => (
                <Picker.Item key={year} label={String(year)} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.dropdownField}>
          <ThemedText style={styles.dropdownLabel}>Month</ThemedText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(value) => setSelectedMonth(String(value))}
              style={styles.picker}
            >
              {monthOptions.map((monthName, index) => (
                <Picker.Item key={monthName} label={monthName} value={String(index)} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.dropdownField}>
          <ThemedText style={styles.dropdownLabel}>Day</ThemedText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedDay}
              onValueChange={(value) => setSelectedDay(String(value))}
              style={styles.picker}
            >
              {dayOptions.map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
}

const calculateAge = (birthday: string) => {
  const birthDate = new Date(birthday);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const formatBirthday = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const userId = Array.isArray(id) ? id[0] : id;
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [isNewAvatar, setIsNewAvatar] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        return;
      }

      setLoading(true);
      try {
        const user = await getUserById(userId);
        if (user) {
          setName(user.name ?? '');
          setUsername(user.username ?? '');
          setBirthday(user.birthday ?? '');
          if (isRenderableAvatar(user.avatar)) {
            setAvatarUri(user.avatar ?? null);
          } else {
            setAvatarUri(null);
          }
          setAvatarBase64(null);
          setAvatarBlob(null);
          setIsNewAvatar(false);
          if (user.birthday) {
            setPickerDate(new Date(user.birthday));
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  useEffect(() => {
    setBirthday(formatBirthday(pickerDate));
  }, [pickerDate]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAvatarUri(Platform.OS === 'web' && asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
        setAvatarBase64(asset.base64 ?? null);
        setAvatarBlob(null);
        setIsNewAvatar(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    const selectedBirthday = formatBirthday(pickerDate);

    if (!name || !username || !selectedBirthday) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const calculatedAge = calculateAge(selectedBirthday);

    if (calculatedAge === null) {
      Alert.alert('Error', 'Use a valid birthday format like YYYY-MM-DD');
      return;
    }

    setLoading(true);
    try {
      let avatarUrl: string | null = null;
      
      // Only upload if a NEW avatar was selected
      if (isNewAvatar && (avatarUri || avatarBlob || avatarBase64)) {
        try {
          const webAvatarDataUrl = avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : avatarUri;

          if (Platform.OS === 'web' && webAvatarDataUrl) {
            avatarUrl = webAvatarDataUrl;
          } else {
            // For new users, we need to create them first to get an ID
            if (!userId) {
              const tempPayload = {
                name,
                username,
                age: calculatedAge,
                birthday: selectedBirthday,
                avatar: '',
              };
              const newUserId = await addUser(tempPayload);
              avatarUrl = await uploadUserAvatar(newUserId, avatarUri || '', avatarBlob, avatarBase64);
              await updateUser(newUserId, { avatar: avatarUrl });
              Alert.alert('Success', 'User created successfully');
              setAvatarUri(null);
              setAvatarBase64(null);
              setAvatarBlob(null);
              setIsNewAvatar(false);
              router.replace('/');
              return;
            } else {
              // For existing users, upload the image
              avatarUrl = await uploadUserAvatar(userId, avatarUri || '', avatarBlob, avatarBase64);
            }
          }
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          Alert.alert('Error', 'Failed to upload photo. ' + (uploadError instanceof Error ? uploadError.message : 'Please try again.'));
          setLoading(false);
          return;
        }
      }

      const payload: any = {
        name,
        username,
        age: calculatedAge,
        birthday: selectedBirthday,
      };
      
      // Only include avatar if we uploaded a new one
      if (avatarUrl) {
        payload.avatar = avatarUrl;
      }

      if (userId) {
        await updateUser(userId, payload);
        Alert.alert('Success', 'User updated successfully');
      } else {
        // Preserve the selected avatar for new web users, otherwise keep the stored URL
        payload.avatar = avatarUrl ?? '';
        await addUser(payload);
        Alert.alert('Success', 'User created successfully');
      }

      setAvatarUri(null);
      setAvatarBase64(null);
      setAvatarBlob(null);
      setIsNewAvatar(false);
      router.replace('/');
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!userId) {
      return;
    }

    const confirmDelete = async () => {
      setLoading(true);
      try {
        await deleteUser(userId);
        Alert.alert('Success', 'User deleted successfully');
        router.replace('/');
      } catch (error) {
        console.error('Error deleting user:', error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete user');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = globalThis.confirm('Are you sure you want to delete this user?');
      if (confirmed) {
        void confirmDelete();
      }
      return;
    }

    Alert.alert('Delete user', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void confirmDelete() },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ThemedText style={styles.headerLink}>← Back</ThemedText>
          </Pressable>

          {userId ? (
            <Pressable onPress={handleDelete} hitSlop={10} disabled={loading} style={styles.deleteHeaderButton}>
              <IconSymbol name="trash" size={18} color="#fff" />
              <ThemedText style={styles.deleteHeaderText}>Delete</ThemedText>
            </Pressable>
          ) : null}
        </View>

        <Image 
          source={isRenderableAvatar(avatarUri) ? { uri: avatarUri } : DEFAULT_AVATAR} 
          style={styles.avatar} 
          contentFit="cover"
          onError={() => {
            setAvatarUri(null);
          }}
        />

        <Pressable style={styles.uploadButton} onPress={pickImage} disabled={loading}>
          <IconSymbol name="photo" size={18} color="#128CFF" />
          <ThemedText style={styles.uploadButtonText}>
            {isRenderableAvatar(avatarUri) ? 'Change Photo' : 'Add Photo'}
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName}
          placeholder="Enter name"
          editable={!loading}
        />

        <ThemedText style={styles.label}>Username</ThemedText>
        <TextInput 
          style={styles.input} 
          value={username} 
          onChangeText={setUsername}
          placeholder="Enter username"
          editable={!loading}
        />

        <ThemedText style={styles.label}>Birthday</ThemedText>
        <ThemedText style={styles.helperText}>Choose year, month, and day below.</ThemedText>
        {Platform.OS === 'web' ? (
          <WebBirthdayPicker date={pickerDate} onDateChange={setPickerDate} />
        ) : (
          <DatePicker
            date={pickerDate}
            onDateChange={setPickerDate}
            mode="date"
            maximumDate={new Date()}
          />
        )}

        <Pressable style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
              {userId ? 'UPDATE' : 'SAVE'}
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f7f8fb' },
  scrollContent: { alignItems: 'center', minHeight: '100%', paddingVertical: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, width: '100%', maxWidth: 600 },
  headerLink: { color: '#128CFF', fontSize: 16, cursor: 'pointer' },
  deleteHeaderButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  deleteHeaderText: { color: '#fff', fontWeight: '600' },
  avatar: { width: 160, height: 160, borderRadius: 80, marginVertical: 18, borderWidth: 3, borderColor: '#e7eefb' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#128CFF', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 20 },
  uploadButtonText: { color: '#128CFF', fontWeight: '600', fontSize: 14 },
  label: { marginTop: 12, marginBottom: 4, fontSize: 16, fontWeight: '600', width: '100%', maxWidth: 600, color: '#111827' },
  helperText: { marginBottom: 10, fontSize: 13, color: '#6b7280', width: '100%', maxWidth: 600 },
  input: { borderWidth: 1, borderColor: '#d7dbe3', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 16, fontSize: 16, width: '100%', maxWidth: 600 },
  saveButton: {
    backgroundColor: '#128CFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 28,
    minWidth: 140,
    width: '100%',
    maxWidth: 600,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(18, 140, 255, 0.2)',
      },
      default: {
        shadowColor: '#128CFF',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  dropdownPickerContainer: { width: '100%', maxWidth: 600, marginTop: 8 },
  dropdownCard: { gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  dropdownField: { flex: 1 },
  dropdownLabel: { marginBottom: 6, fontSize: 14, fontWeight: '600' },
  pickerWrapper: { borderWidth: 1, borderColor: '#d9d9d9', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' },
  picker: { width: '100%', height: 44 },
});
