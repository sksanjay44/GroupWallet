import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyleCombined}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },
  
  secondary: {
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.shadow.light,
  },
  
  ghost: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
  
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  
  large: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  
  disabled: {
    backgroundColor: Colors.gray[300],
    shadowColor: 'transparent',
  },
  
  baseText: {
    fontWeight: '600',
  },
  
  primaryText: {
    color: Colors.white,
  },
  
  secondaryText: {
    color: Colors.white,
  },
  
  outlineText: {
    color: Colors.primary,
  },
  
  ghostText: {
    color: Colors.primary,
  },
  
  smallText: {
    fontSize: 14,
  },
  
  mediumText: {
    fontSize: 16,
  },
  
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    color: Colors.gray[500],
  },
});