import { supabase } from './supabase';
import { Expense, ExpenseCategory, ExpenseSplit } from '@/types';

export async function createExpense(
  groupId: string,
  title: string,
  amount: number,
  category: ExpenseCategory,
  description?: string,
  splitWith?: string[], // Array of user IDs to split with
  splitType: 'equal' | 'custom' = 'equal'
) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create the expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        paid_by_id: user.id,
        amount,
        title,
        description,
        category,
        split_type: splitType,
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Get group members if splitWith is not provided
    let membersToSplitWith = splitWith;
    if (!membersToSplitWith) {
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;
      membersToSplitWith = members.map(m => m.user_id);
    }

    // Calculate split amounts (equal split for now)
    const splitAmount = amount / membersToSplitWith.length;

    // Create expense splits
    const splits = membersToSplitWith.map(userId => ({
      expense_id: expense.id,
      user_id: userId,
      amount: splitAmount,
      is_paid: userId === user.id, // Mark as paid if it's the person who paid
    }));

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splits);

    if (splitsError) throw splitsError;

    return { expense, error: null };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { expense: null, error };
  }
}

export async function getGroupExpenses(groupId: string) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paidBy:paid_by_id(id, name, avatar),
        splits:expense_splits(
          *,
          user:user_id(id, name, avatar)
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { expenses: data, error: null };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return { expenses: null, error };
  }
}

export async function getGroupBalances(groupId: string) {
  try {
    const { data, error } = await supabase
      .from('balances')
      .select(`
        *,
        user:user_id(id, name, avatar)
      `)
      .eq('group_id', groupId)
      .order('net_balance', { ascending: false });

    if (error) throw error;
    return { balances: data, error: null };
  } catch (error) {
    console.error('Error fetching balances:', error);
    return { balances: null, error };
  }
}

export async function getUserExpenseSummary(userId: string) {
  try {
    const { data, error } = await supabase
      .from('balances')
      .select(`
        *,
        group:group_id(id, name, emoji)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const totalBalance = data.reduce((sum, balance) => sum + Number(balance.net_balance), 0);
    const totalOwed = data.reduce((sum, balance) => sum + Number(balance.total_owed), 0);
    const totalLent = data.reduce((sum, balance) => sum + Number(balance.total_paid), 0);

    return {
      summary: {
        totalBalance,
        totalOwed,
        totalLent,
        groupBreakdown: data,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching user summary:', error);
    return { summary: null, error };
  }
}

export async function getExpenseAnalytics(groupId: string, period: 'week' | 'month' | 'year' = 'month') {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId)
      .gte('created_at', getDateForPeriod(period))
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process data for analytics
    const categoryBreakdown = data.reduce((acc: Record<string, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const dailyExpenses = data.reduce((acc: Record<string, number>, expense) => {
      const date = new Date(expense.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const totalAmount = data.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      analytics: {
        categoryBreakdown,
        dailyExpenses,
        totalAmount,
        expenseCount: data.length,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { analytics: null, error };
  }
}

function getDateForPeriod(period: 'week' | 'month' | 'year'): string {
  const now = new Date();
  switch (period) {
    case 'week':
      now.setDate(now.getDate() - 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now.toISOString();
}