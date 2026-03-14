export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  role: 'admin' | 'inventory_manager' | 'warehouse_staff'
  is_active: boolean
  created_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user?: User
}

export interface SignUpPayload {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface DashboardOverview {
  products: {
    total: number
    in_stock: number
    low_stock: number
    out_of_stock: number
  }
  operations: {
    pending_receipts: number
    pending_deliveries: number
    scheduled_transfers: number
  }
  today: {
    receipts_validated: number
    deliveries_validated: number
  }
  activity: {
    movements_last_7_days: number
  }
}

export interface DashboardStockItem {
  id: number
  name: string
  sku: string
  category: string
  current_stock?: number
  min_stock_level?: number
}

export interface DashboardStockItemsResponse {
  count: number
  items: DashboardStockItem[]
}

export interface StockRecord {
  id: number
  product: number
  product_name: string
  product_sku: string
  warehouse?: number
  warehouse_name: string
  location: number
  location_name?: string
  location_code?: string
  quantity: number
  reserved_quantity?: number
  available_quantity?: number
  updated_at: string
}

export interface Product {
  id: number
  name: string
  sku: string
  category: number
  category_name: string
  description: string
  unit_price: string
  uom: number
  uom_name: string
  min_stock: number
  image?: string
  is_active: boolean
  created_at: string
}

export interface Supplier {
  id: number
  name: string
  email: string
  phone: string
  address: string
}

export type OperationStatus = 'draft' | 'confirmed' | 'validated' | 'cancelled' | 'ready' | 'done' | 'waiting'

export interface OperationLine {
  id: number
  product: number
  product_name: string
  product_sku: string
  product_image?: string
  quantity: number
  counted_quantity?: number
  system_quantity?: number
  difference?: number
}

export interface Receipt {
  id: number
  reference: string
  supplier: number
  supplier_name: string
  destination_location: number
  destination_location_name: string
  scheduled_date: string
  status: OperationStatus
  created_by?: number
  created_by_name?: string
  validated_by?: number | null
  validated_by_name?: string | null
  notes: string
  lines: OperationLine[]
  image?: string
  created_at: string
}

export interface Delivery {
  id: number
  reference: string
  source_location: number
  source_location_name: string
  customer_name: string
  customer_reference?: string
  scheduled_date: string
  status: OperationStatus
  created_by?: number
  created_by_name?: string
  validated_by?: number | null
  validated_by_name?: string | null
  notes: string
  lines: OperationLine[]
  image?: string
  created_at: string
}

export interface Transfer {
  id: number
  reference: string
  source_location: number
  source_location_name: string
  destination_location: number
  destination_location_name: string
  scheduled_date: string
  status: OperationStatus
  created_by?: number
  created_by_name?: string
  validated_by?: number | null
  validated_by_name?: string | null
  notes: string
  lines: OperationLine[]
  image?: string
  created_at: string
}

export interface Adjustment {
  id: number
  reference: string
  location: number
  location_name: string
  reason: string
  status: OperationStatus
  created_by?: number
  created_by_name?: string
  validated_by?: number | null
  validated_by_name?: string | null
  notes: string
  lines: OperationLine[]
  image?: string
  created_at: string
}

export interface LedgerEntry {
  id: number
  product: number
  product_name: string
  operation_type: string
  reference: string
  quantity_change: number
  quantity_after: number
  source_location_name: string
  destination_location_name: string
  performed_by_name: string
  timestamp: string
}

export interface Warehouse {
  id: number
  name: string
  code: string
  address: string
  city: string
  state: string
  is_active: boolean
}

export interface Location {
  id: number
  warehouse: number
  warehouse_name: string
  name: string
  code: string
  location_type: string
  is_active: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}