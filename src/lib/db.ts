import { supabase } from './supabase'

// helper: ambil user_id dari session aktif
async function getUid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

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

export async function addExpense(e: Omit<Expense, 'id'> & { added_by?: string }) {
  const uid = await getUid()
  const { added_by: _ab, ...rest } = e
  const { data, error } = await supabase.from('expenses').insert({ ...rest, user_id: uid }).select().single()
  if (error) console.error('addExpense error:', error)
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

export async function addChore(c: { title: string; assignee?: string; repeat_days?: number; due_date?: string | null; done?: boolean; added_by?: string }) {
  const uid = await getUid()
  const { added_by: _ab, ...rest } = c
  const payload = { repeat_days: 0, due_date: null, done: false, ...rest, user_id: uid }
  const { data, error } = await supabase.from('chores').insert(payload).select().single()
  if (error) console.error('addChore error:', error)
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

export async function addShopping(s: { name: string; quantity: string; category: string; added_by?: string }) {
  const uid = await getUid()
  const { added_by: _ab, ...rest } = s
  const { data, error } = await supabase.from('shopping_items').insert({ ...rest, user_id: uid }).select().single()
  if (error) console.error('addShopping error:', error)
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

export async function addBill(b: Omit<Bill, 'id'> & { added_by?: string }) {
  const uid = await getUid()
  const { added_by: _ab, ...rest } = b
  const { data, error } = await supabase.from('bills').insert({ ...rest, user_id: uid }).select().single()
  if (error) console.error('addBill error:', error)
  return data as Bill | null
}

export async function toggleBill(id: string, paid: boolean) {
  await supabase.from('bills').update({ paid }).eq('id', id)
}

export async function deleteBill(id: string) {
  await supabase.from('bills').delete().eq('id', id)
}

// ========== PLANS ==========
export type Plan = {
  id: string
  title: string
  description: string
  date: string
  location: string
  budget: number
  status: 'rencana' | 'selesai' | 'dibatalkan'
}

export async function getPlans() {
  const { data } = await supabase.from('plans').select('*').order('date', { ascending: true })
  return (data || []) as Plan[]
}

export async function addPlan(p: Omit<Plan, 'id' | 'status'> & { status?: Plan['status']; added_by?: string }) {
  const uid = await getUid()
  const { added_by: _ab, ...rest } = p
  const payload = { status: 'rencana', budget: 0, location: '', description: '', ...rest, user_id: uid }
  const { data, error } = await supabase.from('plans').insert(payload).select().single()
  if (error) console.error('addPlan error:', error)
  return data as Plan | null
}

export async function updatePlanStatus(id: string, status: Plan['status']) {
  const { error } = await supabase.from('plans').update({ status }).eq('id', id)
  if (error) console.error('updatePlanStatus error:', error)
}

export async function deletePlan(id: string) {
  await supabase.from('plans').delete().eq('id', id)
}

