import {
  collection, addDoc, getDocs, doc,
  updateDoc, serverTimestamp, query, where, orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: { flowerId: string; flowerName: string; quantity: number; price: number }[];
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  createdAt?: any;
}

export async function placeOrder(data: Omit<Order, 'id' | 'createdAt'>) {
  return await addDoc(collection(db, 'orders'), {
    ...data,
    status: 'PENDING',
    createdAt: serverTimestamp(),
  });
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function getAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(collection(db, 'orders'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  await updateDoc(doc(db, 'orders', id), { status });
}