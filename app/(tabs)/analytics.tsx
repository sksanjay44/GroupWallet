import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, ChartPie as PieChartIcon, TrendingUp, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { getUserExpenseSummary, getExpenseAnalytics } from '@/lib/expenses';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { summary: userSummary } = await getUserExpenseSummary(user!.id);
      setSummary(userSummary);

      // Load analytics for the first group (in a real app, user would select group)
      if (userSummary?.groupBreakdown?.[0]) {
        const groupId = userSummary.groupBreakdown[0].group.id;
        const { analytics: groupAnalytics } = await getExpenseAnalytics(groupId, selectedPeriod);
        setAnalytics(groupAnalytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

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

  const preparePieChartData = () => {
    if (!analytics?.categoryBreakdown) return [];
    
    return Object.entries(analytics.categoryBreakdown).map(([category, amount]) => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount as number,
      color: categoryColors[category as keyof typeof categoryColors] || Colors.gray[500],
    }));
  };

  const prepareBarChartData = () => {
    if (!analytics?.dailyExpenses) return [];
    
    return Object.entries(analytics.dailyExpenses)
      .slice(-7) // Last 7 days
      .map(([date, amount]) => ({
        label: new Date(date).getDate().toString(),
        value: amount as number,
      }));
  };

  if (loading) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={40} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overall Summary */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={24} color={Colors.success} />
            </View>
            <Text style={styles.summaryValue}>₹{summary?.totalBalance?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.summaryLabel}>Net Balance</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <BarChart3 size={24} color={Colors.primary} />
            </View>
            <Text style={styles.summaryValue}>₹{analytics?.totalAmount?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </Card>
        </View>

        {/* Detailed Balance Breakdown */}
        <Card style={styles.balanceCard}>
          <Text style={styles.sectionTitle}>Balance Overview</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <ArrowUpRight size={20} color={Colors.success} />
              <Text style={styles.balanceLabel}>You're owed</Text>
              <Text style={[styles.balanceValue, { color: Colors.success }]}>
                ₹{(summary?.totalLent || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <ArrowDownLeft size={20} color={Colors.error} />
              <Text style={styles.balanceLabel}>You owe</Text>
              <Text style={[styles.balanceValue, { color: Colors.error }]}>
                ₹{(summary?.totalOwed || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Category Breakdown */}
        {analytics?.categoryBreakdown && Object.keys(analytics.categoryBreakdown).length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <PieChartIcon size={24} color={Colors.secondary} />
              <Text style={styles.chartTitle}>Spending by Category</Text>
            </View>
            <PieChart data={preparePieChartData()} size={180} />
          </Card>
        )}

        {/* Daily Spending Trend */}
        {analytics?.dailyExpenses && Object.keys(analytics.dailyExpenses).length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Calendar size={24} color={Colors.accent} />
              <Text style={styles.chartTitle}>Daily Spending (Last 7 Days)</Text>
            </View>
            <BarChart data={prepareBarChartData()} height={160} />
          </Card>
        )}

        {/* Group Breakdown */}
        {summary?.groupBreakdown && summary.groupBreakdown.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Group Balances</Text>
            {summary.groupBreakdown.map((group: any) => (
              <View key={group.group.id} style={styles.groupBalanceItem}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupEmoji}>{group.group.emoji}</Text>
                  <Text style={styles.groupName}>{group.group.name}</Text>
                </View>
                <Text
                  style={[
                    styles.groupBalance,
                    { color: group.net_balance >= 0 ? Colors.success : Colors.error }
                  ]}
                >
                  {group.net_balance >= 0 ? '+' : ''}₹{Number(group.net_balance).toFixed(2)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{analytics?.expenseCount || 0}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{((analytics?.totalAmount || 0) / (analytics?.expenseCount || 1)).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Avg per Expense</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary?.groupBreakdown?.length || 0}</Text>
              <Text style={styles.statLabel}>Active Groups</Text>
            </View>
          </View>
        </Card>
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
  
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 2,
  },
  
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  periodButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  
  periodButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
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
  
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  balanceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
    flex: 1,
  },
  
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  
  groupBalanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  groupEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  
  groupBalance: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});