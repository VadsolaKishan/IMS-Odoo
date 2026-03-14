import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard, GuestGuard, RoleGuard } from '@/lib/guards/AuthGuard'
import AppLayout from '@/layouts/AppLayout'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const SignUpPage = lazy(() => import('@/features/auth/pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ReceiptsListPage = lazy(() => import('@/features/operations/pages/ReceiptsListPage'))
const ReceiptDetailPage = lazy(() => import('@/features/operations/pages/ReceiptDetailPage'))
const DeliveriesListPage = lazy(() => import('@/features/operations/pages/DeliveriesListPage'))
const DeliveryDetailPage = lazy(() => import('@/features/operations/pages/DeliveryDetailPage'))
const TransfersListPage = lazy(() => import('@/features/operations/pages/TransfersListPage'))
const TransferDetailPage = lazy(() => import('@/features/operations/pages/TransferDetailPage'))
const AdjustmentsListPage = lazy(() => import('@/features/operations/pages/AdjustmentsListPage'))
const AdjustmentDetailPage = lazy(() => import('@/features/operations/pages/AdjustmentDetailPage'))
const StockPage = lazy(() => import('@/features/stock/pages/StockPage'))
const MoveHistoryPage = lazy(() => import('@/features/history/pages/MoveHistoryPage'))
const WarehousesPage = lazy(() => import('@/features/settings/pages/WarehousesPage'))
const LocationsPage = lazy(() => import('@/features/settings/pages/LocationsPage'))
const UsersPage = lazy(() => import('@/features/settings/pages/UsersPage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))

function SuspenseLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    </div>
  )
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SuspenseLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <GuestGuard><SuspenseWrap><LoginPage /></SuspenseWrap></GuestGuard>,
  },
  {
    path: '/signup',
    element: <GuestGuard><SuspenseWrap><SignUpPage /></SuspenseWrap></GuestGuard>,
  },
  {
    path: '/forgot-password',
    element: <GuestGuard><SuspenseWrap><ForgotPasswordPage /></SuspenseWrap></GuestGuard>,
  },
  {
    path: '/',
    element: <AuthGuard><AppLayout /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },
      { path: 'operations/receipts', element: <SuspenseWrap><ReceiptsListPage /></SuspenseWrap> },
      { path: 'operations/receipts/:id', element: <SuspenseWrap><ReceiptDetailPage /></SuspenseWrap> },
      { path: 'operations/deliveries', element: <SuspenseWrap><DeliveriesListPage /></SuspenseWrap> },
      { path: 'operations/deliveries/:id', element: <SuspenseWrap><DeliveryDetailPage /></SuspenseWrap> },
      { path: 'operations/transfers', element: <SuspenseWrap><TransfersListPage /></SuspenseWrap> },
      { path: 'operations/transfers/:id', element: <SuspenseWrap><TransferDetailPage /></SuspenseWrap> },
      { path: 'operations/adjustments', element: <RoleGuard roles={['admin', 'inventory_manager']}><SuspenseWrap><AdjustmentsListPage /></SuspenseWrap></RoleGuard> },
      { path: 'operations/adjustments/:id', element: <RoleGuard roles={['admin', 'inventory_manager']}><SuspenseWrap><AdjustmentDetailPage /></SuspenseWrap></RoleGuard> },
      { path: 'stock', element: <SuspenseWrap><StockPage /></SuspenseWrap> },
      { path: 'move-history', element: <SuspenseWrap><MoveHistoryPage /></SuspenseWrap> },
      { path: 'settings/warehouses', element: <RoleGuard roles={['admin', 'inventory_manager', 'warehouse_staff']}><SuspenseWrap><WarehousesPage /></SuspenseWrap></RoleGuard> },
      { path: 'settings/locations', element: <RoleGuard roles={['admin', 'inventory_manager', 'warehouse_staff']}><SuspenseWrap><LocationsPage /></SuspenseWrap></RoleGuard> },
      {
        path: 'settings/users',
        element: <RoleGuard roles={['admin']}><SuspenseWrap><UsersPage /></SuspenseWrap></RoleGuard>,
      },
      { path: 'profile', element: <SuspenseWrap><ProfilePage /></SuspenseWrap> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
