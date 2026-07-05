import { useState } from 'react';
import {
  View, Text, Pressable, TextInput,
  Modal, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { updateUserName, changeUserPassword } from '@/services/authService';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [nameModal, setNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [passModal, setPassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const openNameModal = () => {
    setNewName(user?.name ?? '');
    setNameError('');
    setNameModal(true);
  };

  const handleSaveName = async () => {
    setNameError('');
    if (!newName.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    if (newName.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }
    if (newName.trim() === user?.name) {
      setNameError('That\'s already your name!');
      return;
    }
    setSavingName(true);
    try {
      await updateUserName(user!.uid, newName.trim());
      Alert.alert('✅ Updated!', 'Your name has been changed. Please re-login to see changes.');
      setNameModal(false);
    } catch (e: any) {
      setNameError(e.message || 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const openPassModal = () => {
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setPassError('');
    setPassModal(true);
  };

  const handleChangePassword = async () => {
    setPassError('');
    if (!currentPass || !newPass || !confirmPass) {
      setPassError('Please fill in all fields.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }
    if (currentPass === newPass) {
      setPassError('New password must be different from current password.');
      return;
    }
    setSavingPass(true);
    try {
      await changeUserPassword(currentPass, newPass);
      Alert.alert('✅ Password changed!', 'Your password has been updated successfully.');
      setPassModal(false);
    } catch (e: any) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setPassError('Current password is incorrect.');
      } else {
        setPassError(e.message || 'Failed to change password.');
      }
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <ScrollView className="flex-1 px-5 pt-8">
        <Text className="text-2xl font-bold text-pink-700 mb-6">Profile</Text>

        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-pink-200 items-center justify-center mb-3">
            <Text className="text-4xl">🌸</Text>
          </View>
          <Text className="text-xl font-bold text-pink-900">{user?.name}</Text>
          <Text className="text-pink-400 text-sm mt-1">{user?.email}</Text>
          <View className="mt-2 bg-pink-100 px-3 py-1 rounded-full">
            <Text className="text-pink-600 text-xs font-semibold capitalize">{user?.role}</Text>
          </View>
        </View>
        <Text className="text-xs font-semibold text-pink-400 uppercase tracking-wide mb-3">
          Account Settings
        </Text>

        <View className="bg-white rounded-2xl overflow-hidden border border-pink-100 mb-4">
          <Pressable
            onPress={openNameModal}
            className="flex-row items-center p-4 border-b border-pink-50 active:bg-pink-50"
          >
            <Text className="text-lg mr-3">✏️</Text>
            <View className="flex-1">
              <Text className="text-pink-900 font-semibold">Change Name</Text>
              <Text className="text-pink-400 text-xs">{user?.name}</Text>
            </View>
            <Text className="text-pink-300">›</Text>
          </Pressable>

          <Pressable
            onPress={openPassModal}
            className="flex-row items-center p-4 active:bg-pink-50"
          >
            <Text className="text-lg mr-3">🔒</Text>
            <View className="flex-1">
              <Text className="text-pink-900 font-semibold">Change Password</Text>
              <Text className="text-pink-400 text-xs">Update your password</Text>
            </View>
            <Text className="text-pink-300">›</Text>
          </Pressable>
        </View>

        {user?.role === 'admin' && (
          <>
            <Text className="text-xs font-semibold text-pink-400 uppercase tracking-wide mb-3">
              Admin
            </Text>
            <Pressable
              onPress={() => router.push('/admin')}
              className="bg-white rounded-2xl p-4 mb-4 border border-pink-100 flex-row items-center active:bg-pink-50"
            >
              <Text className="text-lg mr-3">🛠</Text>
              <Text className="text-pink-700 font-semibold flex-1">Admin Panel</Text>
              <Text className="text-pink-300">›</Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={handleSignOut}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 items-center mt-2 mb-8"
        >
          <Text className="text-red-500 font-semibold">Sign Out</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={nameModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-pink-50">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-pink-100">
            <Text className="text-xl font-bold text-pink-700">Change Name</Text>
            <Pressable onPress={() => setNameModal(false)}>
              <Text className="text-pink-400">Cancel</Text>
            </Pressable>
          </View>

          <View className="px-5 pt-6">
            <Text className="text-sm font-medium text-pink-700 mb-2">Full Name</Text>
            <TextInput
              value={newName}
              onChangeText={(t) => { setNewName(t); setNameError(''); }}
              placeholder="Enter your name"
              placeholderTextColor="#D88FB0"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-1 text-pink-900"
            />
            {nameError ? (
              <Text className="text-red-500 text-xs mb-3">{nameError}</Text>
            ) : (
              <View className="mb-3" />
            )}

            <Pressable
              onPress={handleSaveName}
              disabled={savingName}
              className="bg-pink-600 rounded-2xl py-4 items-center mt-2"
            >
              {savingName
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-semibold">Save Name</Text>
              }
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={passModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-pink-50">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-pink-100">
            <Text className="text-xl font-bold text-pink-700">Change Password</Text>
            <Pressable onPress={() => setPassModal(false)}>
              <Text className="text-pink-400">Cancel</Text>
            </Pressable>
          </View>

          <View className="px-5 pt-6">
            <Text className="text-sm font-medium text-pink-700 mb-2">Current Password</Text>
            <TextInput
              value={currentPass}
              onChangeText={(t) => { setCurrentPass(t); setPassError(''); }}
              placeholder="Enter current password"
              placeholderTextColor="#D88FB0"
              secureTextEntry
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900"
            />

            <Text className="text-sm font-medium text-pink-700 mb-2">New Password</Text>
            <TextInput
              value={newPass}
              onChangeText={(t) => { setNewPass(t); setPassError(''); }}
              placeholder="At least 6 characters"
              placeholderTextColor="#D88FB0"
              secureTextEntry
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900"
            />

            <Text className="text-sm font-medium text-pink-700 mb-2">Confirm New Password</Text>
            <TextInput
              value={confirmPass}
              onChangeText={(t) => { setConfirmPass(t); setPassError(''); }}
              placeholder="Re-enter new password"
              placeholderTextColor="#D88FB0"
              secureTextEntry
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-1 text-pink-900"
            />

            {passError ? (
              <Text className="text-red-500 text-xs mb-3">{passError}</Text>
            ) : (
              <View className="mb-3" />
            )}

            <Pressable
              onPress={handleChangePassword}
              disabled={savingPass}
              className="bg-pink-600 rounded-2xl py-4 items-center mt-2"
            >
              {savingPass
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-semibold">Update Password</Text>
              }
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}