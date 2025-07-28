import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ variant = 'default', children, style }: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  
  default: {
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  elevated: {
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: 'transparent',
  },
});