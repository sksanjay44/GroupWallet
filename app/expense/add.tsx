import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ShoppingCart, Utensils, Zap, Car, Film, ShoppingBag, Plane, MoveHorizontal as MoreHorizontal, Users, X } from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { createExpense } from '@/lib/expenses';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { ExpenseCategory } from '@/types';

export default function AddExpenseScreen() {
  const { user } = useAuth();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('other');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
  });

  const categories = [
    { key: 'groceries', label: 'Groceries', icon: ShoppingCart, color: Colors.success },
    { key: 'dining', label: 'Dining', icon: Utensils, color: Colors.accent },
    { key: 'bills', label: 'Bills', icon: Zap, color: Colors.error },
    { key: 'transport', label: 'Transport', icon: Car, color: Colors.secondary },
    { key: 'entertainment', label: 'Entertainment', icon: Film, color: Colors.primaryLight },
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: Colors.warning },
    { key: 'travel', label: 'Travel', icon: Plane, color: Colors.primary },
    { key: 'other', label: 'Other', icon: MoreHorizontal, color: Colors.gray[500] },
  ];

  useEffect(() => {
    if (groupId) {
      loadGroupMembers();
    }
  }, [groupId]);

  const loadGroupMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          user_id,
          user:user_id(id, name, avatar)
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      
      setGroupMembers(data);
      // Pre-select all members by default
      setSelectedMembers(data.map(member => member.user_id));
    } catch (error) {
      console.error('Error loading group members:', error);
      Alert.alert('Error', 'Failed to load group members');
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateExpense = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter expense title');
      return;
    }

    if (!formData.amount || isNaN(Number(formData.amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member to split with');
      return;
    }

    setLoading(true);

    try {
      const { expense, error } = await createExpense(
        groupId!,
        formData.title,
        Number(formData.amount),
        selectedCategory,
        formData.description,
        selectedMembers
      );

      if (error) throw error;

      Alert.alert('Success', 'Expense added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', error.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Input
            label="Expense Title"
            placeholder="What did you pay for?"
            value={formData.title}
            onChangeText={(title) => setFormData({ ...formData, title })}
          />

          <Input
            label="Amount (₹)"
            placeholder="0.00"
            value={formData.amount}
            onChangeText={(amount) => setFormData({ ...formData, amount })}
            keyboardType="numeric"
          />

          <Input
            label="Description (Optional)"
            placeholder="Add some details..."
            value={formData.description}
            onChangeText={(description) => setFormData({ ...formData, description })}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card style={styles.categoryCard}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.key && styles.categoryItemSelected
                ]}
                onPress={() => setSelectedCategory(category.key as ExpenseCategory)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <category.icon size={20} color={category.color} />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategory === category.key && styles.categoryLabelSelected
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.membersCard}>
          <View style={styles.membersHeader}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Split With</Text>
            <Text style={styles.memberCount}>
              {selectedMembers.length} of {groupMembers.length}
            </Text>
          </View>

          <View style={styles.membersList}>
            {groupMembers.map((member) => (
              <TouchableOpacity
                key={member.user_id}
                style={[
                  styles.memberItem,
                  selectedMembers.includes(member.user_id) && styles.memberItemSelected
                ]}
                onPress={() => toggleMember(member.user_id)}
              >
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>{member.user.name}</Text>
                  {member.user_id === user?.id && (
                    <Text style={styles.youLabel}>(You)</Text>
                  )}
                </View>
                <View style={[
                  styles.checkbox,
                  selectedMembers.includes(member.user_id) && styles.checkboxSelected
                ]}>
                  {selectedMembers.includes(member.user_id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedMembers.length > 0 && formData.amount && (
            <View style={styles.splitPreview}>
              <Text style={styles.splitPreviewTitle}>Split Preview</Text>
              <Text style={styles.splitPreviewAmount}>
                ₹{(Number(formData.amount) / selectedMembers.length).toFixed(2)} per person
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleCreateExpense}
            disabled={loading}
            style={styles.createButton}
          >
            {loading ? <LoadingSpinner size={20} color={Colors.white} /> : 'Add Expense'}
          </Button>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  formCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  
  categoryItemSelected: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  categoryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  categoryLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  
  membersCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  memberCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 'auto',
  },
  
  membersList: {
    marginBottom: 16,
  },
  
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  
  memberItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  
  memberName: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  
  youLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  
  checkmark: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: 'bold',
  },
  
  splitPreview: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  
  splitPreviewTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  
  splitPreviewAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  
  createButton: {
    marginTop: 16,
  },
});