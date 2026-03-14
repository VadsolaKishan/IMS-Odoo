export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    lowStock: ['dashboard', 'low-stock'] as const,
    outOfStock: ['dashboard', 'out-of-stock'] as const,
  },
  receipts: {
    list: (filters?: Record<string, unknown>) => ['receipts', 'list', filters] as const,
    detail: (id: string | number) => ['receipts', 'detail', id] as const,
  },
  deliveries: {
    list: (filters?: Record<string, unknown>) => ['deliveries', 'list', filters] as const,
    detail: (id: string | number) => ['deliveries', 'detail', id] as const,
  },
  transfers: {
    list: (filters?: Record<string, unknown>) => ['transfers', 'list', filters] as const,
    detail: (id: string | number) => ['transfers', 'detail', id] as const,
  },
  adjustments: {
    list: (filters?: Record<string, unknown>) => ['adjustments', 'list', filters] as const,
    detail: (id: string | number) => ['adjustments', 'detail', id] as const,
  },
  stock: {
    list: (filters?: Record<string, unknown>) => ['stock', 'list', filters] as const,
    product: (id: string | number) => ['stock', 'product', id] as const,
  },
  ledger: {
    list: (filters?: Record<string, unknown>) => ['ledger', 'list', filters] as const,
    product: (id: string | number) => ['ledger', 'product', id] as const,
  },
  products: {
    list: (filters?: Record<string, unknown>) => ['products', 'list', filters] as const,
    detail: (id: string | number) => ['products', 'detail', id] as const,
    categories: ['products', 'categories'] as const,
    uom: ['products', 'uom'] as const,
  },
  suppliers: {
    list: ['suppliers', 'list'] as const,
  },
  settings: {
    warehouses: ['settings', 'warehouses'] as const,
    locations: (filters?: Record<string, unknown>) => ['settings', 'locations', filters] as const,
    users: (filters?: Record<string, unknown>) => ['settings', 'users', filters] as const,
  },
}
