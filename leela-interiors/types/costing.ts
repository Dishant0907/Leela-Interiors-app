export type Section = 'kitchen' | 'accessories' | 'hardware' | 'civil'
export type TransactionType = 'intra' | 'inter'

export interface LineItem {
  id: string
  description: string
  hsn_sac?: string
  unit: string
  qty: number
  rate: number
  amount: number
}

export interface CostingFormState {
  clientId?: string
  clientName: string
  clientPhone: string
  clientAddress: string
  clientReference: string
  clientGstin?: string
  shutterTop: string
  shutterBase: string
  cabinetColor: string
  sections: Record<Section, LineItem[]>
  freight: number
  gstRate: number
  transactionType: TransactionType
  notes: string
}

export interface Totals {
  kitchenTotal: number
  accessoriesTotal: number
  hardwareTotal: number
  civilTotal: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  gstAmount: number
  grandTotal: number
}

export interface BusinessProfile {
  business_name: string
  gstin: string
  address: string
  state_code: string
  pan?: string | null
  bank_account_no?: string | null
  bank_ifsc?: string | null
  bank_name?: string | null
  terms_conditions?: string | null
}
