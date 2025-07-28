import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, ArrowUpRight, ArrowDownLeft, Users, TrendingUp } from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function HomeScreen() {
  const { user } = useAuth();

  const mockData = {
    totalBalance: 2450.75,
    totalOwed: 890.25,
    totalLent: 1560.50,
    recentTransactions: [
      { id: '1', title: 'Groceries', amount: -450, type: 'expense', date: '2 hours ago' },
      { id: '2', title: 'Rent Payment', amount: -1200, type: 'expense', date: '1 day ago' },
      { id: '3', title: 'Settlement from John', amount: 300, type: 'settlement', date: '2 days ago' },
    ],
    activeGroups: [
      { id: '1', name: 'Roommates', members: 4, emoji: '🏠' },
      { id: '2', name: 'Office Team', members: 8, emoji: '💼' },
    ],
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
            <Text style={styles.subGreeting}>Here's your expense overview</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TrendingUp size={20} color={Colors.success} />
          </View>
          <Text style={styles.balanceAmount}>₹{mockData.totalBalance.toFixed(2)}</Text>
          
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <ArrowUpRight size={16} color={Colors.success} />
              <Text style={styles.balanceItemLabel}>You're owed</Text>
              <Text style={[styles.balanceItemValue, { color: Colors.success }]}>
                ₹{mockData.totalLent.toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <ArrowDownLeft size={16} color={Colors.error} />
              <Text style={styles.balanceItemLabel}>You owe</Text>
              <Text style={[styles.balanceItemValue, { color: Colors.error }]}>
                ₹{mockData.totalOwed.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Plus size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Users size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.actionText}>New Group</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Groups</Text>
            <TouchableOpacity onPress={() => router.push('/groups')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {mockData.activeGroups.map((group) => (
            <Card key={group.id} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupEmoji}>{group.emoji}</Text>
                  <View>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>{group.members} members</Text>
                  </View>
                </View>
                <ArrowUpRight size={20} color={Colors.text.tertiary} />
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {mockData.recentTransactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: transaction.amount > 0 ? Colors.success : Colors.text.primary }
                  ]}
                >
                  {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
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
  
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  
  subGreeting: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.primary,
  },
  
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  balanceLabel: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 16,
  },
  
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  balanceItemLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginLeft: 6,
    flex: 1,
  },
  
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  sectionLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  
  groupCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
  },
  
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  groupEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  groupMembers: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  
  transactionCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
  },
  
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  transactionInfo: {
    flex: 1,
  },
  
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  transactionDate: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});