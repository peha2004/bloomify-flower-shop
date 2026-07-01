import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, serverTimestamp, query, where
} from 'firebase/firestore';
import { db } from './firebase';

export interface Flower {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: string[];
  category: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt?: any;
}

export async function getFlowers(): Promise<Flower[]> {
  const q = query(collection(db, 'flowers'), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Flower));
}

export async function getAllFlowers(): Promise<Flower[]> {
  const snapshot = await getDocs(collection(db, 'flowers'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Flower));
}

export async function addFlower(data: Omit<Flower, 'id' | 'createdAt'>) {
  return await addDoc(collection(db, 'flowers'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}


export async function updateFlower(id: string, data: Partial<Flower>) {
  await updateDoc(doc(db, 'flowers', id), data);
}

export async function deleteFlower(id: string) {
  await deleteDoc(doc(db, 'flowers', id));
}