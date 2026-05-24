// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, clearProfile, fetchProfile, UserProfile } from '../store/slices/userSlice';
import { fetchContacts, addContact, deleteContact } from '../store/slices/contactsSlice';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { profile, isLoading, error } = useAppSelector((state) => state.user);
  const { contacts, loading: contactsLoading } = useAppSelector((state) => state.contacts);

  const [formData, setFormData] = useState<UserProfile>({
    full_name: '',
    phone_number: '',
    blood_group: '',
    medical_notes: '',
    profile_image: '',
  });
  const [newContact, setNewContact] = useState({ contact_name: '', relationship: '', phone_number: '' });
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  // Sync redux → local form on mount
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // Fetch profile on initial load
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchContacts());
  }, [dispatch]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // ─── Image Picker ──────────────────────────────────────────────────────────
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access in your device settings to upload a profile picture.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async () => {
    Alert.alert('Change Photo', 'Choose a photo source', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Gallery', onPress: () => openGallery() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openGallery = async () => {
    const ok = await requestPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      handleChange('profile_image', result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      handleChange('profile_image', result.assets[0].uri);
    }
  };

  const handleAddContact = () => {
    if (!newContact.contact_name.trim() || !newContact.relationship.trim() || !newContact.phone_number.trim()) {
      Alert.alert('Validation Error', 'All fields are required for a new contact.');
      return;
    }
    dispatch(addContact(newContact))
      .unwrap()
      .then(() => {
        setNewContact({ contact_name: '', relationship: '', phone_number: '' });
      })
      .catch((err: string) => Alert.alert('Error', err));
  };

  // ─── CRUD Operations ───────────────────────────────────────────────────────
  const handleSave = () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!formData.phone_number.trim()) {
      Alert.alert('Validation Error', 'Phone Number is required.');
      return;
    }
    if (!formData.blood_group) {
      Alert.alert('Validation Error', 'Please select your blood group.');
      return;
    }
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        setIsDirty(false);
        Alert.alert('✅ Saved', 'Your profile has been updated successfully.');
      })
      .catch((err: string) => Alert.alert('Save Failed', err));
  };

  const handleDelete = () => {
    Alert.alert(
      'Clear Profile Data',
      'This will erase all your saved information. Emergency responders will not have access to your medical details. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () =>
            dispatch(clearProfile())
              .unwrap()
              .then(() => Alert.alert('Cleared', 'Profile data has been erased.')),
        },
      ]
    );
  };

  const initial = formData.full_name ? formData.full_name.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#facc15" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
          <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => {
                if (formData.profile_image) {
                  setIsImageModalVisible(true);
                } else {
                  handlePickImage();
                }
              }} 
              activeOpacity={0.85}
            >
              <View style={styles.avatarOuter}>
                {formData.profile_image ? (
                  <Image source={{ uri: formData.profile_image }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitial}>{initial}</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Separate button to change photo */}
            <TouchableOpacity 
              style={styles.changePhotoBadge}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <MaterialIcons name="camera-alt" size={18} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={handlePickImage} style={{ marginTop: 12 }}>
            <Text style={styles.avatarHint}>Change Photo</Text>
          </TouchableOpacity>
          {formData.profile_image ? (
            <TouchableOpacity
              onPress={() => handleChange('profile_image', '')}
              style={styles.removePhotoBtn}
            >
              <Text style={styles.removePhotoText}>Remove Photo</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Form Card */}
        <View style={styles.card}>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="person" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor="#4b5563"
                value={formData.full_name}
                onChangeText={(t) => handleChange('full_name', t)}
                returnKeyType="next"
              />
              {formData.full_name ? (
                <TouchableOpacity onPress={() => handleChange('full_name', '')}>
                  <MaterialIcons name="close" size={18} color="#6b7280" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="phone" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="+91 99999 99999"
                placeholderTextColor="#4b5563"
                keyboardType="phone-pad"
                value={formData.phone_number}
                onChangeText={(t) => handleChange('phone_number', t)}
              />
              {formData.phone_number ? (
                <TouchableOpacity onPress={() => handleChange('phone_number', '')}>
                  <MaterialIcons name="close" size={18} color="#6b7280" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Blood Group Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Blood Group <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => setShowBloodPicker((p) => !p)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="bloodtype" size={20} color="#ef4444" />
              <Text style={[styles.input, !formData.blood_group && { color: '#4b5563' }]}>
                {formData.blood_group || 'Select blood group'}
              </Text>
              <MaterialIcons
                name={showBloodPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={22}
                color="#6b7280"
              />
            </TouchableOpacity>
            {showBloodPicker && (
              <View style={styles.bloodGrid}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodChip, formData.blood_group === bg && styles.bloodChipActive]}
                    onPress={() => {
                      handleChange('blood_group', bg);
                      setShowBloodPicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.bloodChipText, formData.blood_group === bg && styles.bloodChipTextActive]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Medical Notes */}
          <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
            <Text style={styles.fieldLabel}>Medical Notes <Text style={styles.optional}>(Optional)</Text></Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                placeholder="List allergies, medications, chronic conditions, etc."
                placeholderTextColor="#4b5563"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.medical_notes}
                onChangeText={(t) => handleChange('medical_notes', t)}
              />
            </View>
            <Text style={styles.charCount}>{formData.medical_notes?.length || 0} characters</Text>
          </View>

        </View>

        {/* Dirty state warning */}
        {isDirty && (
          <View style={styles.unsavedBanner}>
            <MaterialIcons name="info-outline" size={16} color="#facc15" />
            <Text style={styles.unsavedText}>You have unsaved changes</Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorBox}>
            <MaterialIcons name="error-outline" size={20} color="#f87171" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && styles.saveBtnLoading, !isDirty && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isLoading || !isDirty}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <MaterialIcons name="save-alt" size={22} color="#000000" />
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.discardBtn}
          onPress={() => {
            if (profile) setFormData(profile);
            setIsDirty(false);
          }}
          disabled={!isDirty}
          activeOpacity={0.75}
        >
          <Text style={[styles.discardBtnText, !isDirty && styles.discardBtnTextDisabled]}>Discard Changes</Text>
        </TouchableOpacity>

        {/* Emergency Contacts Section */}
        <View style={[styles.card, { marginTop: 24 }]}>
          <Text style={[styles.fieldLabel, { fontSize: 13, color: '#facc15', marginBottom: 16 }]}>Emergency Contacts ({contacts.length}/5)</Text>
          
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{contact.contact_name} <Text style={styles.contactRel}>• {contact.relationship}</Text></Text>
                <Text style={styles.contactPhone}>{contact.phone_number}</Text>
              </View>
              <TouchableOpacity onPress={() => dispatch(deleteContact(contact.id))} style={styles.deleteContactBtn}>
                <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}

          {contacts.length < 5 && (
            <View style={styles.addContactForm}>
              <TextInput
                style={[styles.input, styles.contactInput]}
                placeholder="Name"
                placeholderTextColor="#4b5563"
                value={newContact.contact_name}
                onChangeText={(t) => setNewContact({ ...newContact, contact_name: t })}
              />
              <TextInput
                style={[styles.input, styles.contactInput]}
                placeholder="Relationship"
                placeholderTextColor="#4b5563"
                value={newContact.relationship}
                onChangeText={(t) => setNewContact({ ...newContact, relationship: t })}
              />
              <TextInput
                style={[styles.input, styles.contactInput]}
                placeholder="Phone Number"
                placeholderTextColor="#4b5563"
                keyboardType="phone-pad"
                value={newContact.phone_number}
                onChangeText={(t) => setNewContact({ ...newContact, phone_number: t })}
              />
              <TouchableOpacity style={styles.addContactBtn} onPress={handleAddContact} disabled={contactsLoading}>
                {contactsLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <>
                    <MaterialIcons name="add" size={20} color="#000000" />
                    <Text style={styles.addContactBtnText}>Add Contact</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Full Image Viewer Modal */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setIsImageModalVisible(false)} activeOpacity={1} />
          <View style={styles.modalImageContainer}>
            <Image source={{ uri: formData.profile_image }} style={styles.modalImage} resizeMode="contain" />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsImageModalVisible(false)}>
              <MaterialIcons name="close" size={32} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  headerBtn: { padding: 8 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 24, paddingBottom: 60 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  avatarOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#111827',
    borderWidth: 3,
    borderColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 60 },
  avatarInitial: { color: '#facc15', fontSize: 40, fontWeight: '900' },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#facc15',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  avatarHint: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  removePhotoBtn: { marginTop: 8 },
  removePhotoText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },

  // Form
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { color: '#9ca3af', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 2 },
  required: { color: '#ef4444' },
  optional: { color: '#6b7280', textTransform: 'none', letterSpacing: 0 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 10,
    fontSize: 15,
    paddingVertical: 8,
  },

  // Blood group
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  bloodChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  bloodChipActive: {
    backgroundColor: '#facc15',
    borderColor: '#facc15',
  },
  bloodChipText: { color: '#9ca3af', fontWeight: '700', fontSize: 14 },
  bloodChipTextActive: { color: '#000000' },

  // Text area
  textAreaBox: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: { color: '#ffffff', fontWeight: '500', fontSize: 14, minHeight: 100 },
  charCount: { color: '#4b5563', fontSize: 11, marginTop: 6, marginLeft: 4 },

  // Unsaved banner
  unsavedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,204,21,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  unsavedText: { color: '#facc15', fontSize: 13, fontWeight: '600' },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127,29,29,0.3)',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  errorText: { color: '#f87171', fontSize: 13, fontWeight: '600', flex: 1 },

  // Buttons
  saveBtn: {
    width: '100%',
    backgroundColor: '#facc15',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  saveBtnLoading: { backgroundColor: '#ca8a04' },
  saveBtnDisabled: { backgroundColor: '#374151', opacity: 0.6 },
  saveBtnText: { color: '#000000', fontWeight: '800', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
  discardBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  discardBtnText: { color: '#9ca3af', fontWeight: '600', fontSize: 14 },
  discardBtnTextDisabled: { color: '#374151' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalImageContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: -50,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
  },

  // Contacts
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  contactName: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  contactRel: { color: '#9ca3af', fontWeight: '500', fontSize: 13 },
  contactPhone: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  deleteContactBtn: { padding: 8 },
  addContactForm: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  contactInput: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    marginLeft: 0,
    paddingHorizontal: 12,
  },
  addContactBtn: {
    backgroundColor: '#facc15',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  addContactBtnText: { color: '#000000', fontWeight: '700', fontSize: 14 },
});
