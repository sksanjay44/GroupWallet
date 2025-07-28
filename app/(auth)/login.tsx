import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Lock } from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function LoginScreen() {
  const { signInWithPhone, verifyOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    const { error } = await signInWithPhone(phone);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone number');
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>💰</Text>
              </View>
            </View>
            <Text style={styles.title}>GroupWallet</Text>
            <Text style={styles.subtitle}>Smart expense sharing for groups</Text>
          </View>

          <View style={styles.form}>
            {!otpSent ? (
              <>
                <View style={styles.inputContainer}>
                  <Phone size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                  <Input
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    style={styles.input}
                  />
                </View>
                
                <Button
                  onPress={handleSendOtp}
                  disabled={loading}
                  style={styles.button}
                >
                  {loading ? <LoadingSpinner size={20} color={Colors.white} /> : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Lock size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                  <Input
                    label="Enter OTP"
                    placeholder="123456"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.input}
                  />
                </View>
                
                <Button
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  style={styles.button}
                >
                  {loading ? <LoadingSpinner size={20} color={Colors.white} /> : 'Verify OTP'}
                </Button>
                
                <Button
                  variant="ghost"
                  onPress={() => setOtpSent(false)}
                  style={styles.backButton}
                  textStyle={styles.backButtonText}
                >
                  Back to Phone Number
                </Button>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  
  container: {
    flex: 1,
    padding: 20,
  },
  
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  
  logoContainer: {
    marginBottom: 24,
  },
  
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.heavy,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  
  logoText: {
    fontSize: 36,
  },
  
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  
  form: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  
  inputContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 44,
    zIndex: 1,
  },
  
  input: {
    paddingLeft: 48,
    backgroundColor: Colors.white,
    borderColor: 'transparent',
  },
  
  button: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow.medium,
    marginBottom: 16,
  },
  
  backButton: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
  
  backButtonText: {
    color: Colors.white,
  },
});