import { getBills, type Bill } from './db'

export type BillAlert = {
  bill: Bill
  type: 'overdue' | 'due_soon' | 'due_today'
  message: string
}

export async function getBillAlerts(): Promise<BillAlert[]> {
  const bills = await getBills()
  const now = new Date()
  const alerts: BillAlert[] = []

  for (const bill of bills) {
    if (bill.paid) continue
    const due = new Date(bill.due_date)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      alerts.push({ bill, type: 'overdue', message: `${bill.name} terlambat ${Math.abs(diffDays)} hari! (${fmt(bill.amount)})` })
    } else if (diffDays === 0) {
      alerts.push({ bill, type: 'due_today', message: `${bill.name} jatuh tempo HARI INI (${fmt(bill.amount)})` })
    } else if (diffDays <= 3) {
      alerts.push({ bill, type: 'due_soon', message: `${bill.name} jatuh tempo ${diffDays} hari lagi (${fmt(bill.amount)})` })
    }
  }

  return alerts.sort((a, b) => {
    const order = { overdue: 0, due_today: 1, due_soon: 2 }
    return order[a.type] - order[b.type]
  })
}

const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
