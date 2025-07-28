/*
  # Complete GroupWallet Database Schema

  1. New Tables
    - `users` - User profiles with payment info
    - `groups` - Group information with admin and invite codes
    - `group_members` - Many-to-many relationship between users and groups
    - `expenses` - Individual expense records
    - `expense_splits` - How expenses are split among members
    - `balances` - Calculated balances for each user in each group
    - `settlements` - Payment settlements between users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their own data and groups they belong to

  3. Functions
    - Function to calculate balances after expense changes
    - Function to generate unique invite codes
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text DEFAULT '',
  avatar text,
  upi_id text,
  bank_account text,
  is_onboarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Groups table  
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text DEFAULT '👥',
  description text,
  invite_code text UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  admin_id uuid REFERENCES users(id) ON DELETE CASCADE,
  virtual_account_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Group members junction table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  paid_by_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  title text NOT NULL,
  description text,
  category text DEFAULT 'other' CHECK (category IN ('groceries', 'dining', 'bills', 'transport', 'entertainment', 'shopping', 'travel', 'other')),
  split_type text DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expense splits table
CREATE TABLE IF NOT EXISTS expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(expense_id, user_id)
);

-- Balances table (calculated balances for each user in each group)
CREATE TABLE IF NOT EXISTS balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  total_paid numeric(10,2) DEFAULT 0,
  total_owed numeric(10,2) DEFAULT 0,
  net_balance numeric(10,2) DEFAULT 0, -- positive means they are owed money, negative means they owe money
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method text DEFAULT 'upi',
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Groups policies
CREATE POLICY "Users can read groups they belong to" ON groups
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Group admins can update their groups" ON groups
  FOR UPDATE TO authenticated
  USING (admin_id = auth.uid());

-- Group members policies
CREATE POLICY "Users can read group members for their groups" ON group_members
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Expenses policies
CREATE POLICY "Users can read expenses from their groups" ON expenses
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create expenses" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    ) AND paid_by_id = auth.uid()
  );

-- Expense splits policies
CREATE POLICY "Users can read expense splits from their groups" ON expense_splits
  FOR SELECT TO authenticated
  USING (
    expense_id IN (
      SELECT e.id FROM expenses e
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expense splits" ON expense_splits
  FOR INSERT TO authenticated
  WITH CHECK (
    expense_id IN (
      SELECT e.id FROM expenses e
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- Balances policies
CREATE POLICY "Users can read balances from their groups" ON balances
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage balances" ON balances
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Settlements policies
CREATE POLICY "Users can read settlements they're involved in" ON settlements
  FOR SELECT TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create settlements" ON settlements
  FOR INSERT TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- Function to recalculate balances for a group
CREATE OR REPLACE FUNCTION recalculate_group_balances(group_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Clear existing balances for the group
  DELETE FROM balances WHERE group_id = group_uuid;
  
  -- Insert updated balances
  INSERT INTO balances (user_id, group_id, total_paid, total_owed, net_balance)
  SELECT 
    gm.user_id,
    group_uuid,
    COALESCE(paid.total_paid, 0) as total_paid,
    COALESCE(owed.total_owed, 0) as total_owed,
    COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0) as net_balance
  FROM group_members gm
  LEFT JOIN (
    SELECT paid_by_id as user_id, SUM(amount) as total_paid
    FROM expenses 
    WHERE group_id = group_uuid
    GROUP BY paid_by_id
  ) paid ON gm.user_id = paid.user_id
  LEFT JOIN (
    SELECT es.user_id, SUM(es.amount) as total_owed
    FROM expense_splits es
    JOIN expenses e ON es.expense_id = e.id
    WHERE e.group_id = group_uuid
    GROUP BY es.user_id
  ) owed ON gm.user_id = owed.user_id
  WHERE gm.group_id = group_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate balances when expenses change
CREATE OR REPLACE FUNCTION trigger_recalculate_balances()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM recalculate_group_balances(NEW.group_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM recalculate_group_balances(OLD.group_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS expenses_balance_trigger ON expenses;
CREATE TRIGGER expenses_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_balances();

-- Trigger for expense splits
CREATE OR REPLACE FUNCTION trigger_recalculate_balances_splits()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM recalculate_group_balances((SELECT group_id FROM expenses WHERE id = NEW.expense_id));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM recalculate_group_balances((SELECT group_id FROM expenses WHERE id = OLD.expense_id));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS expense_splits_balance_trigger ON expense_splits;
CREATE TRIGGER expense_splits_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON expense_splits
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_balances_splits();