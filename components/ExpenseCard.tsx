import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  ShoppingCart, 
  Utensils, 
  Zap, 
  Car, 
  Film, 
  ShoppingBag, 
  Plane, 
  MoreHorizontal 
} from 'lucide-react-native';
import { Card } from './ui/Card';
import { Colors } from '@/constants/Colors';
import { ExpenseCategory } from '@/types';

interface ExpenseCardProps {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  splitCount: number;
  onPress?: () => void;
}

export function ExpenseCard({
  title,
  amount,
  category,
  paidBy,
  createdAt,
  splitCount,
  onPress,
}: ExpenseCardProps) {
  const categoryIcons = {
    groceries: ShoppingCart,
    dining: Utensils,
    bills: Zap,
    transport: Car,
    entertainment: Film,
    shopping: ShoppingBag,
    travel: Plane,
    other: MoreHorizontal,
  };

  const categoryColors = {
    groceries: Colors.success,
    dining: Colors.accent,
    bills: Colors.error,
    transport: Colors.secondary,
    entertainment: Colors.primaryLight,
    shopping: Colors.warning,
    travel: Colors.primary,
    other: Colors.gray[500],
  };

  const Icon = categoryIcons[category];
  const iconColor = categoryColors[category];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.categoryIcon}>
            <Icon size={20} color={iconColor} />
          </View>
          <Text style={styles.amount}>₹{amount.toFixed(2)}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.details}>
            <Text style={styles.paidBy}>Paid by {paidBy.name}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.splitInfo}>Split {splitCount} ways</Text>
          </View>
          <Text style={styles.date}>{formatDate(createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  paidBy: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  separator: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginHorizontal: 6,
  },

  splitInfo: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  date: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});