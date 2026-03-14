import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/guards/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ClipboardList, Boxes, History, Settings, Warehouse, MapPin, Users, UserCircle,
  LogOut, Menu, X, ChevronDown, Bell
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Operations', icon: Package,
    children: [
      { label: 'Receipts', to: '/operations/receipts', icon: ArrowDownToLine },
      { label: 'Deliveries', to: '/operations/deliveries', icon: ArrowUpFromLine },
      { label: 'Transfers', to: '/operations/transfers', icon: ArrowLeftRight },
      { label: 'Adjustments', to: '/operations/adjustments', icon: ClipboardList },
    ],
  },
  { label: 'Stock', to: '/stock', icon: Boxes },
  { label: 'Move History', to: '/move-history', icon: History },
  {
    label: 'Settings', icon: Settings,
    children: [
      { label: 'Warehouses', to: '/settings/warehouses', icon: Warehouse },
      { label: 'Locations', to: '/settings/locations', icon: MapPin },
      { label: 'Users', to: '/settings/users', icon: Users },
    ],
  },
]

function DesktopNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { user } = useAuth()

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => {
        // Skip Adjustments and Users for warehouse_staff
        if (user?.role === 'warehouse_staff') {
          if (item.label === 'Operations') {
            const filteredChildren = item.children?.filter(c => c.label !== 'Adjustments')
            if (filteredChildren) {
              return (
                <div key={item.label} className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                    openDropdown === item.label ? 'bg-surface-tertiary text-primary' : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                  )}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-200 opacity-60', openDropdown === item.label && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-52 bg-surface backdrop-blur-xl rounded-2xl shadow-modal border border-border py-2 z-50 overflow-hidden text-left"
                      >
                        <div className="px-2 space-y-0.5">
                          {filteredChildren.map((child) => (
                            <NavLink key={child.to} to={child.to} onClick={() => setOpenDropdown(null)}
                              className={({ isActive }) => cn(
                                'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl',
                                isActive ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                              )}
                            >
                              <child.icon className="w-5 h-5" />
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }
          }
          if (item.label === 'Settings') {
             // For warehouses/locations, staff can see but maybe not manage? 
             // According to plan, they can see. User management is forbidden.
             const filteredChildren = item.children?.filter(c => c.label !== 'Users')
             return (
              <div key={item.label} className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  openDropdown === item.label ? 'bg-surface-tertiary text-primary' : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                )}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-200 opacity-60', openDropdown === item.label && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {openDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-52 bg-surface backdrop-blur-xl rounded-2xl shadow-modal border border-border py-2 z-50 overflow-hidden text-left"
                    >
                      <div className="px-2 space-y-0.5">
                        {filteredChildren?.map((child) => (
                          <NavLink key={child.to} to={child.to} onClick={() => setOpenDropdown(null)}
                            className={({ isActive }) => cn(
                              'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl',
                              isActive ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                            )}
                          >
                            <child.icon className="w-5 h-5" />
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }
        }

        return item.children ? (
          <div key={item.label} className="relative"
            onMouseEnter={() => setOpenDropdown(item.label)}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              openDropdown === item.label ? 'bg-surface-tertiary text-primary' : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
            )}>
              <item.icon className="w-5 h-5" />
              {item.label}
              <ChevronDown className={cn('w-4 h-4 transition-transform duration-200 opacity-60', openDropdown === item.label && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {openDropdown === item.label && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-52 bg-surface backdrop-blur-xl rounded-2xl shadow-modal border border-border py-2 z-50 overflow-hidden text-left"
                >
                  <div className="px-2 space-y-0.5">
                    {item.children.map((child) => {
                      // Special handling for Users option
                      if (child.label === 'Users') {
                        if (user?.role !== 'admin') {
                          return (
                            <span
                              key={child.to}
                              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl opacity-50 cursor-not-allowed select-none"
                              title="Only admins can access Users"
                            >
                              <child.icon className="w-5 h-5" />
                              {child.label}
                            </span>
                          )
                        }
                      }
                      return (
                        <NavLink key={child.to} to={child.to} onClick={() => setOpenDropdown(null)}
                          className={({ isActive }) => cn(
                            'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-xl',
                            isActive ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                          )}
                        >
                          <child.icon className="w-5 h-5" />
                          {child.label}
                        </NavLink>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <NavLink key={item.to} to={item.to!}
            className={({ isActive }) => cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              isActive ? 'bg-surface text-primary shadow-sm ring-1 ring-border' : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-2 rounded-full hover:bg-surface-tertiary text-text-secondary hover:text-text-primary transition-colors relative group">
        <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-surface shadow-sm" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.96 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-2xl shadow-modal border border-border py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border mb-2 bg-surface-secondary flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">Notifications</span>
              <span className="text-xs text-primary font-medium cursor-pointer hover:underline" onClick={() => alert('Mark all as read (not implemented)')}>Mark all as read</span>
            </div>
            <div className="px-2 max-h-[300px] overflow-y-auto space-y-1">
              <div className="p-3 text-sm hover:bg-surface-tertiary rounded-xl transition-colors cursor-pointer" onClick={() => alert('Notification clicked (not implemented)')}>
                <p className="font-semibold text-text-primary">Low Stock Alert</p>
                <p className="text-xs text-text-muted mt-0.5">Product SKU-123 is below minimum threshold.</p>
              </div>
              <div className="p-3 text-sm hover:bg-surface-tertiary rounded-xl transition-colors cursor-pointer" onClick={() => alert('Notification clicked (not implemented)')}>
                <p className="font-semibold text-text-primary">Delivery Validated</p>
                <p className="text-xs text-text-muted mt-0.5">Delivery WH/OUT/001 was validated by Admin.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-tertiary transition-all">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold shadow-sm ring-2 ring-white/50">
          {user?.first_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="hidden md:flex flex-col items-start pr-1">
          <span className="text-sm font-semibold text-text-primary max-w-[100px] truncate leading-tight">
            {user?.first_name || 'User'}
          </span>
          <span className="text-[10px] text-text-muted leading-tight font-medium uppercase tracking-wider">{user?.role || 'Staff'}</span>
        </div>
        {/* No dropdown arrow here! */}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.96 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl shadow-modal border border-border py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border mb-2 bg-surface-secondary">
              <p className="text-sm font-bold text-text-primary truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-text-muted truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="px-2 space-y-0.5">
              <button onClick={() => { setOpen(false); navigate('/profile') }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-tertiary hover:text-text-primary rounded-xl transition-colors"
              >
                <UserCircle className="w-5 h-5" /> Profile Settings
              </button>
              <button onClick={() => { setOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-danger hover:bg-danger-light hover:text-danger rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-text-muted backdrop-blur-sm z-40 lg:hidden" onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-surface shadow-modal z-50 flex flex-col lg:hidden border-r border-border"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-border bg-surface-secondary">
              <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
                <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                  <Package className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-text-primary">CoreInventory</span>
              </Link>
              <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-surface-tertiary text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
              {navItems.map((item) => {
                // Skip restricted items for warehouse_staff
                if (user?.role === 'warehouse_staff') {
                   if (item.label === 'Operations') {
                     const filteredChildren = item.children?.filter(c => c.label !== 'Adjustments')
                     return (
                       <div key={item.label} className="mb-1">
                         <button onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                           className={cn(
                             'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                             expanded === item.label ? 'bg-surface-tertiary text-text-primary' : 'text-text-secondary hover:bg-surface-tertiary'
                           )}
                         >
                           <span className="flex items-center gap-3"><item.icon className="w-5 h-5 opacity-70" /> {item.label}</span>
                           <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', expanded === item.label && 'rotate-180')} />
                         </button>
                         <AnimatePresence>
                           {expanded === item.label && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                               className="overflow-hidden ml-5 border-l-2 border-border pl-2 mt-1 space-y-0.5"
                             >
                               {filteredChildren?.map((child) => (
                                 <NavLink key={child.to} to={child.to} onClick={onClose}
                                   className={({ isActive }) => cn(
                                     'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                                     isActive ? 'text-primary font-semibold bg-primary-50' : 'text-text-secondary font-medium hover:bg-surface-tertiary'
                                   )}
                                 >
                                   <child.icon className="w-5 h-5 opacity-70" /> {child.label}
                                 </NavLink>
                               ))}
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>
                     )
                   }
                   if (item.label === 'Settings') {
                     const filteredChildren = item.children?.filter(c => c.label !== 'Users')
                     return (
                       <div key={item.label} className="mb-1">
                         <button onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                           className={cn(
                             'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                             expanded === item.label ? 'bg-surface-tertiary text-text-primary' : 'text-text-secondary hover:bg-surface-tertiary'
                           )}
                         >
                           <span className="flex items-center gap-3"><item.icon className="w-5 h-5 opacity-70" /> {item.label}</span>
                           <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', expanded === item.label && 'rotate-180')} />
                         </button>
                         <AnimatePresence>
                           {expanded === item.label && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                               className="overflow-hidden ml-5 border-l-2 border-border pl-2 mt-1 space-y-0.5"
                             >
                               {filteredChildren?.map((child) => (
                                 <NavLink key={child.to} to={child.to} onClick={onClose}
                                   className={({ isActive }) => cn(
                                     'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                                     isActive ? 'text-primary font-semibold bg-primary-50' : 'text-text-secondary font-medium hover:bg-surface-tertiary'
                                   )}
                                 >
                                   <child.icon className="w-5 h-5 opacity-70" /> {child.label}
                                 </NavLink>
                               ))}
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>
                     )
                   }
                }

                return item.children ? (
                  <div key={item.label} className="mb-1">
                    <button onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                        expanded === item.label ? 'bg-surface-tertiary text-text-primary' : 'text-text-secondary hover:bg-surface-tertiary'
                      )}
                    >
                      <span className="flex items-center gap-3"><item.icon className="w-5 h-5 opacity-70" /> {item.label}</span>
                      <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', expanded === item.label && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {expanded === item.label && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden ml-5 border-l-2 border-border pl-2 mt-1 space-y-0.5"
                        >
                          {item.children.map((child) => (
                            <NavLink key={child.to} to={child.to} onClick={onClose}
                              className={({ isActive }) => cn(
                                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                                isActive ? 'text-primary font-semibold bg-primary-50' : 'text-text-secondary font-medium hover:bg-surface-tertiary'
                              )}
                            >
                              <child.icon className="w-5 h-5 opacity-70" /> {child.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink key={item.to} to={item.to!} onClick={onClose}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-1',
                      isActive ? 'text-primary bg-primary-50 ring-1 ring-primary-100' : 'text-text-secondary hover:bg-surface-tertiary'
                    )}
                  >
                    <item.icon className="w-5 h-5 opacity-70" /> {item.label}
                  </NavLink>
                )
              })}
            </div>
            <div className="border-t border-border p-4 space-y-1 bg-surface-secondary">
              <button onClick={() => { onClose(); navigate('/profile') }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors">
                <UserCircle className="w-5 h-5 opacity-70" /> Profile Settings
              </button>
              <button onClick={() => { onClose(); logout(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger-light hover:text-danger transition-colors">
                <LogOut className="w-5 h-5 opacity-70" /> Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function MobileBottomTabs() {
  const tabs = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Operations', to: '/operations/receipts', icon: Package },
    { label: 'Stock', to: '/stock', icon: Boxes },
    { label: 'History', to: '/move-history', icon: History },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface backdrop-blur-xl border-t border-border z-30 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 min-w-[64px]',
              isActive ? 'text-primary scale-105' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            <tab.icon className={cn('w-5 h-5', 'transition-colors')} strokeWidth={2.5} />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary selection:bg-primary/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-surface backdrop-blur-md border-b border-border shadow-nav transition-all duration-300">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <div className="flex items-center gap-5">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-surface-tertiary transition-colors lg:hidden text-text-secondary hover:text-text-primary">
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary hidden sm:block">
                CoreInventory
              </span>
            </Link>
          </div>
          <DesktopNav />
          <div className="flex items-center gap-3">
            <NotificationMenu />
            <div className="w-px h-6 bg-border/60 hidden md:block mx-1"></div>
            <UserMenu />
          </div>
        </div>
      </header>

      <MobileSheet open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 pb-24 lg:pb-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="w-full h-full flex flex-col items-center"
          >
            <div className="w-full max-w-6xl">
              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileBottomTabs />
    </div>
  )
}



