import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { Card } from './ui/Card';
import { Colors } from '@/constants/Colors';

interface BalanceCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

export function BalanceCard({ user, totalPaid, totalOwed, netBalance }: BalanceCardProps) {
  const isPositive = netBalance >= 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
        <View style={styles.balanceContainer}>
          {isPositive ? (
            <ArrowUpRight size={16} color={Colors.success} />
          ) : (
            <ArrowDownLeft size={16} color={Colors.error} />
          )}
          <Text
            style={[
              styles.netBalance,
              { color: isPositive ? Colors.success : Colors.error }
            ]}
          >
            {isPositive ? '+' : ''}₹{Math.abs(netBalance).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Paid</Text>
          <Text style={styles.breakdownValue}>₹{totalPaid.toFixed(2)}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Owes</Text>
          <Text style={styles.breakdownValue}>₹{totalOwed.toFixed(2)}</Text>
        </View>
      </View>
    </Card>
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

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },

  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  netBalance: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },

  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  breakdownItem: {
    alignItems: 'center',
  },

  breakdownLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },

  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});