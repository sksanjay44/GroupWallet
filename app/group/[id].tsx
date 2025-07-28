import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Users, Share, Settings, TrendingUp, ArrowLeft, ChartBar as BarChart3 } from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getGroupExpenses, getGroupBalances } from '@/lib/expenses';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExpenseCard } from '@/components/ExpenseCard';
import { BalanceCard } from '@/components/BalanceCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function GroupDetailScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async () => {
    try {
      // Load group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(
            *,
            user:user_id(id, name, avatar)
          )
        `)
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Load expenses and balances
      const [expensesResult, balancesResult] = await Promise.all([
        getGroupExpenses(id!),
        getGroupBalances(id!)
      ]);

      if (expensesResult.expenses) setExpenses(expensesResult.expenses);
      if (balancesResult.balances) setBalances(balancesResult.balances);

    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroupData();
    setRefreshing(false);
  };

  const handleAddExpense = () => {
    router.push({
      pathname: '/expense/add',
      params: { groupId: id }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={40} />
          <Text style={styles.loadingText}>Loading group...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const userBalance = balances.find(b => b.user_id === user?.id);

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.groupEmoji}>{group.emoji}</Text>
          <Text style={styles.groupName}>{group.name}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={Colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Group Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>₹{totalExpenses.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Expenses</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Users size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{group.members?.length || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <BarChart3 size={20} color={userBalance?.net_balance >= 0 ? Colors.success : Colors.error} />
            </View>
            <Text style={[
              styles.statValue,
              { color: userBalance?.net_balance >= 0 ? Colors.success : Colors.error }
            ]}>
              {userBalance?.net_balance >= 0 ? '+' : ''}₹{Math.abs(userBalance?.net_balance || 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Your Balance</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button onPress={handleAddExpense} style={styles.addExpenseButton}>
            <Plus size={16} color={Colors.white} />
            <Text style={styles.addExpenseText}>Add Expense</Text>
          </Button>
          
          <TouchableOpacity style={styles.shareButton}>
            <Share size={16} color={Colors.primary} />
            <Text style={styles.shareText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
            onPress={() => setActiveTab('expenses')}
          >
            <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>
              Expenses ({expenses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'balances' && styles.tabActive]}
            onPress={() => setActiveTab('balances')}
          >
            <Text style={[styles.tabText, activeTab === 'balances' && styles.tabTextActive]}>
              Balances ({balances.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'expenses' ? (
          <View style={styles.expensesList}>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  id={expense.id}
                  title={expense.title}
                  amount={Number(expense.amount)}
                  category={expense.category}
                  paidBy={expense.paidBy}
                  createdAt={expense.created_at}
                  splitCount={expense.splits?.length || 0}
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No expenses yet</Text>
                <Text style={styles.emptyText}>
                  Add your first expense to start tracking group spending
                </Text>
                <Button onPress={handleAddExpense} style={styles.emptyButton}>
                  Add First Expense
                </Button>
              </Card>
            )}
          </View>
        ) : (
          <View style={styles.balancesList}>
            {balances.length > 0 ? (
              balances.map((balance) => (
                <BalanceCard
                  key={balance.user_id}
                  user={balance.user}
                  totalPaid={Number(balance.total_paid)}
                  totalOwed={Number(balance.total_owed)}
                  netBalance={Number(balance.net_balance)}
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No balances yet</Text>
                <Text style={styles.emptyText}>
                  Balances will appear here once expenses are added
                </Text>
              </Card>
            )}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  
  groupEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  settingsButton: {
    padding: 8,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  errorText: {
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  
  addExpenseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  addExpenseText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  shareText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 4,
  },
  
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  
  expensesList: {
    paddingBottom: 32,
  },
  
  balancesList: {
    paddingBottom: 32,
  },
  
  emptyCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    padding: 32,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  
  emptyButton: {
    paddingHorizontal: 24,
  },
});