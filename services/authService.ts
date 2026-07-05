import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc , collection, getDocs} from 'firebase/firestore';
import { auth, db } from './firebase';

export async function registerUser(name: string, email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email,
    role: 'customer',
    createdAt: new Date().toISOString(),
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  await firebaseSignOut(auth);
}

export async function getUserProfile(uid: string) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export async function updateUserName(uid: string, name: string) {
  await updateDoc(doc(db, 'users', uid), { name });
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string
) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not logged in');

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => d.data());
}