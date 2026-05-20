import { database, storage } from '@/config/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export interface User extends DocumentData {
  id?: string;
  name: string;
  username: string;
  age: number;
  birthday?: string;
  avatar?: string;
}

// CREATE: Add a new user
export const addUser = async (userData: User): Promise<string> => {
  try {
    const docRef = await addDoc(collection(database, 'users'), userData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// READ: Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(database, 'users'));
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// READ: Get a single user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(database, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// READ: Get users by username
export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const q = query(collection(database, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

// UPDATE: Update a user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    const docRef = doc(database, 'users', userId);
    await updateDoc(docRef, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// DELETE: Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(database, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// UPLOAD: Upload user avatar to Firebase Storage
export const uploadUserAvatar = async (
  userId: string,
  imageUri: string,
  imageBlob?: Blob | null,
  imageBase64?: string | null
): Promise<string> => {
  try {
    let blob = imageBlob;
    
    // Prefer base64 on web so we do not depend on temporary blob URLs.
    if (!blob && imageBase64) {
      const response = await fetch(`data:image/jpeg;base64,${imageBase64}`);
      blob = await response.blob();
    }

    // If no blob provided, try to fetch from URI
    if (!blob) {
      try {
        console.log('Attempting to fetch image from URI:', imageUri.substring(0, 50));
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        blob = await response.blob();
        console.log('Successfully fetched blob, size:', blob.size);
      } catch (fetchError) {
        console.error('Failed to fetch image from URI:', fetchError);
        throw new Error('Unable to process image. Please try selecting the image again.');
      }
    }
    
    if (!blob) {
      throw new Error('No image data available');
    }
    
    console.log('Uploading blob to Firebase Storage, size:', blob.size);
    const storageRef = ref(storage, `avatars/${userId}/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Successfully uploaded, URL:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};
