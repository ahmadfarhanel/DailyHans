import { supabase } from './supabase'

// ========== EXPENSES ==========
export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

export async function getExpenses(limit = 50) {
  const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false }).limit(limit)
  return (data || []) as Expense[]
}

export async function addExpense(e: Omit<Expense, 'id'>) {
  const { data } = await supabase.from('expenses').insert(e).select().single()
  return data as Expense | null
}

export async function deleteExpense(id: string) {
  await supabase.from('expenses').delete().eq('id', id)
}

// ========== CHORES ==========
export type Chore = {
  id: string
  title: string
  assignee: string
  done: boolean
  due_date: string | null
  repeat_days: number
}

export async function getChores() {
  const { data } = await supabase.from('chores').select('*').order('created_at', { ascending: false })
  return (data || []) as Chore[]
}

export async function addChore(c: { title: string; assignee: string; repeat_days: number; due_date?: string }) {
  const { data } = await supabase.from('chores').insert(c).select().single()
  return data as Chore | null
}

export async function toggleChore(id: string, done: boolean) {
  await supabase.from('chores').update({ done }).eq('id', id)
}

export async function deleteChore(id: string) {
  await supabase.from('chores').delete().eq('id', id)
}

// ========== SHOPPING ==========
export type ShoppingItem = {
  id: string
  name: string
  quantity: string
  bought: boolean
  category: string
}

export async function getShopping() {
  const { data } = await supabase.from('shopping_items').select('*').order('created_at', { ascending: false })
  return (data || []) as ShoppingItem[]
}

export async function addShopping(s: { name: string; quantity: string; category: string }) {
  const { data } = await supabase.from('shopping_items').insert(s).select().single()
  return data as ShoppingItem | null
}

export async function toggleShopping(id: string, bought: boolean) {
  await supabase.from('shopping_items').update({ bought }).eq('id', id)
}

export async function deleteShopping(id: string) {
  await supabase.from('shopping_items').delete().eq('id', id)
}

// ========== BILLS ==========
export type Bill = {
  id: string
  name: string
  amount: number
  due_date: string
  paid: boolean
  recurring: string
  category: string
}

export async function getBills() {
  const { data } = await supabase.from('bills').select('*').order('due_date', { ascending: true })
  return (data || []) as Bill[]
}

export async function addBill(b: Omit<Bill, 'id'>) {
  const { data } = await supabase.from('bills').insert(b).select().single()
  return data as Bill | null
}

export async function toggleBill(id: string, paid: boolean) {
  await supabase.from('bills').update({ paid }).eq('id', id)
}

export async function deleteBill(id: string) {
  await supabase.from('bills').delete().eq('id', id)
}
