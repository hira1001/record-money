-- RecordMoney Database Schema
-- Run this in Supabase SQL Editor

-- 1. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  name text not null,
  color text default '#3b82f6',
  icon text default 'default',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 2. Transactions Table (Main Ledger)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  amount integer not null,
  type text check (type in ('income', 'expense')) not null,
  category_id uuid references public.categories,
  description text,
  date timestamptz not null default now(),
  status text default 'confirmed' check (status in ('confirmed', 'review_needed')),
  source text default 'manual' check (source in ('manual', 'ocr', 'gmail_auto')),
  created_at timestamptz default now()
);

-- 3. Budgets Table
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category_id uuid references public.categories,
  amount_limit integer not null,
  period text default 'monthly' check (period in ('weekly', 'monthly', 'yearly')),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- RLS Policies for Categories
create policy "Users can view their own categories and defaults"
  on public.categories for select
  using (user_id = auth.uid() or is_default = true);

create policy "Users can create their own categories"
  on public.categories for insert
  with check (user_id = auth.uid());

create policy "Users can update their own categories"
  on public.categories for update
  using (user_id = auth.uid());

create policy "Users can delete their own categories"
  on public.categories for delete
  using (user_id = auth.uid() and is_default = false);

-- RLS Policies for Transactions
create policy "Users can view their own transactions"
  on public.transactions for select
  using (user_id = auth.uid());

create policy "Users can create their own transactions"
  on public.transactions for insert
  with check (user_id = auth.uid());

create policy "Users can update their own transactions"
  on public.transactions for update
  using (user_id = auth.uid());

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (user_id = auth.uid());

-- RLS Policies for Budgets
create policy "Users can view their own budgets"
  on public.budgets for select
  using (user_id = auth.uid());

create policy "Users can create their own budgets"
  on public.budgets for insert
  with check (user_id = auth.uid());

create policy "Users can update their own budgets"
  on public.budgets for update
  using (user_id = auth.uid());

create policy "Users can delete their own budgets"
  on public.budgets for delete
  using (user_id = auth.uid());

-- Insert Default Categories
insert into public.categories (name, color, icon, is_default) values
  ('食費', '#f59e0b', 'food', true),
  ('交通費', '#3b82f6', 'transport', true),
  ('日用品', '#8b5cf6', 'shopping', true),
  ('娯楽', '#ec4899', 'entertainment', true),
  ('医療', '#ef4444', 'health', true),
  ('住居', '#06b6d4', 'housing', true),
  ('給与', '#10b981', 'income', true),
  ('その他', '#6b7280', 'default', true)
on conflict do nothing;

-- Create indexes for better performance
create index if not exists idx_transactions_user_date on public.transactions (user_id, date desc);
create index if not exists idx_transactions_category on public.transactions (category_id);
create index if not exists idx_budgets_user on public.budgets (user_id);
