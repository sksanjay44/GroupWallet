export interface User {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
  upiId?: string;
  bankAccount?: string;
  isOnboarded: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  inviteCode: string;
  adminId: string;
  virtualAccountId?: string;
  createdAt: string;
  members: GroupMember[];
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user: User;
}

export interface Expense {
  id: string;
  groupId: string;
  paidById: string;
  amount: number;
  title: string;
  description?: string;
  category: ExpenseCategory;
  splitType: 'equal' | 'custom';
  splitWith: ExpenseSplit[];
  createdAt: string;
  paidBy: User;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  isPaid: boolean;
  user: User;
}

export type ExpenseCategory = 
  | 'groceries' 
  | 'dining' 
  | 'bills' 
  | 'transport' 
  | 'entertainment' 
  | 'shopping' 
  | 'travel' 
  | 'other';

export interface Balance {
  userId: string;
  groupId: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
  user: User;
}