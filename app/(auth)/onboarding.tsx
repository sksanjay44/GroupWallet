import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, CreditCard, Building } from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function OnboardingScreen() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    upiId: '',
    bankAccount: '',
  });

  const handleComplete = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.upiId.trim()) {
      Alert.alert('Error', 'Please enter your UPI ID');
      return;
    }

    setLoading(true);
    
    const { error } = await updateProfile({
      name: formData.name,
      upiId: formData.upiId,
      bankAccount: formData.bankAccount,
      isOnboarded: true,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us set up your account for seamless group payments
            </Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(name) => setFormData({ ...formData, name })}
                autoComplete="name"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <CreditCard size={24} color={Colors.secondary} />
                <Text style={styles.sectionTitle}>Payment Details</Text>
              </View>
              
              <Input
                label="UPI ID"
                placeholder="yourname@paytm"
                value={formData.upiId}
                onChangeText={(upiId) => setFormData({ ...formData, upiId })}
                keyboardType="email-address"
                autoComplete="email"
              />
              
              <Input
                label="Bank Account (Optional)"
                placeholder="Enter account number"
                value={formData.bankAccount}
                onChangeText={(bankAccount) => setFormData({ ...formData, bankAccount })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoBox}>
              <Building size={20} color={Colors.accent} />
              <Text style={styles.infoText}>
                Your payment details are securely encrypted and used only for group settlements
              </Text>
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleComplete}
              disabled={loading}
              style={styles.button}
            >
              {loading ? <LoadingSpinner size={20} color={Colors.white} /> : 'Complete Setup'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  
  header: {
    marginBottom: 32,
    paddingTop: 20,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  
  card: {
    marginBottom: 32,
  },
  
  section: {
    marginBottom: 24,
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
  
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.accent + '10',
    borderColor: Colors.accent + '30',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  
  buttonContainer: {
    paddingBottom: 40,
  },
  
  button: {
    marginTop: 16,
  },
});