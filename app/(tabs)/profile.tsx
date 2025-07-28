import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, CreditCard, Building, Settings, LogOut, CreditCard as Edit, Shield, Bell, Moon, CircleHelp as HelpCircle } from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    upiId: user?.upiId || '',
    bankAccount: user?.bankAccount || '',
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    
    const { error } = await updateProfile(formData);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    }
    
    setLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const profileOptions = [
    { icon: Settings, label: 'Account Settings', onPress: () => {} },
    { icon: Bell, label: 'Notifications', onPress: () => {} },
    { icon: Shield, label: 'Privacy & Security', onPress: () => {} },
    { icon: Moon, label: 'Dark Mode', onPress: () => {} },
    { icon: HelpCircle, label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditing(!editing)}
        >
          <Edit size={20} color={editing ? Colors.success : Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
              <View style={styles.onboardedBadge}>
                <Text style={styles.onboardedText}>
                  {user?.isOnboarded ? 'Account Complete' : 'Setup Required'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Profile Details */}
        <Card style={styles.detailsCard}>
          <View style={styles.sectionHeader}>
            <User size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          
          {editing ? (
            <Input
              label="Full Name"
              value={formData.name}
              onChangeText={(name) => setFormData({ ...formData, name })}
            />
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
            </View>
          )}
        </Card>

        {/* Payment Details */}
        <Card style={styles.detailsCard}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>
          
          {editing ? (
            <>
              <Input
                label="UPI ID"
                value={formData.upiId}
                onChangeText={(upiId) => setFormData({ ...formData, upiId })}
                placeholder="yourname@paytm"
              />
              <Input
                label="Bank Account"
                value={formData.bankAccount}
                onChangeText={(bankAccount) => setFormData({ ...formData, bankAccount })}
                placeholder="Enter account number"
              />
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>UPI ID</Text>
                <Text style={styles.infoValue}>{user?.upiId || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bank Account</Text>
                <Text style={styles.infoValue}>
                  {user?.bankAccount ? `****${user.bankAccount.slice(-4)}` : 'Not set'}
                </Text>
              </View>
            </>
          )}
        </Card>

        {editing && (
          <View style={styles.editActions}>
            <Button
              variant="outline"
              onPress={() => {
                setEditing(false);
                setFormData({
                  name: user?.name || '',
                  upiId: user?.upiId || '',
                  bankAccount: user?.bankAccount || '',
                });
              }}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSaveProfile}
              disabled={loading}
              style={styles.saveButton}
            >
              {loading ? <LoadingSpinner size={20} color={Colors.white} /> : 'Save Changes'}
            </Button>
          </View>
        )}

        {/* Profile Options */}
        {!editing && (
          <Card style={styles.optionsCard}>
            <Text style={styles.sectionTitle}>Settings</Text>
            {profileOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionRow}
                onPress={option.onPress}
              >
                <View style={styles.optionLeft}>
                  <option.icon size={20} color={Colors.text.secondary} />
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Security Info */}
        {!editing && (
          <Card style={styles.securityCard}>
            <View style={styles.sectionHeader}>
              <Building size={24} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>
            <Text style={styles.securityText}>
              Your payment details are encrypted and stored securely. We never store your full bank account details.
            </Text>
          </Card>
        )}

        {/* Sign Out */}
        {!editing && (
          <View style={styles.signOutContainer}>
            <Button
              variant="outline"
              onPress={handleSignOut}
              style={styles.signOutButton}
              textStyle={styles.signOutText}
            >
              <LogOut size={16} color={Colors.error} />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  
  profileInfo: {
    flex: 1,
  },
  
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  profilePhone: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  
  onboardedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  onboardedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  
  detailsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  infoLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  
  editActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  
  cancelButton: {
    flex: 1,
  },
  
  saveButton: {
    flex: 1,
  },
  
  optionsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  optionLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  
  optionArrow: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  
  securityCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  securityText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  
  signOutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  signOutButton: {
    borderColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  signOutText: {
    color: Colors.error,
  },
  
  signOutButtonText: {
    color: Colors.error,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});