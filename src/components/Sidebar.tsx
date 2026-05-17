import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import type { ViewType } from '@/types';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Sparkles,
  Repeat,
  PieChart,
  Wallet,
  Shield,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions' as ViewType, label: 'Transacciones', icon: Receipt },
  { id: 'recurring' as ViewType, label: 'Recurrentes', icon: Repeat },
  { id: 'budgets' as ViewType, label: 'Presupuestos', icon: PieChart },
  { id: 'organizer' as ViewType, label: 'Organizador', icon: Wallet },
  { id: 'savings' as ViewType, label: 'Ahorro', icon: PiggyBank },
  { id: 'analytics' as ViewType, label: 'Análisis', icon: BarChart3 },
  { id: 'security' as ViewType, label: 'Seguridad', icon: Shield },
];

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [currentView]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="p-2 bg-primary-600 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
          <p className="text-xs text-gray-500">Gestión inteligente</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="space-y-1 flex-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-primary-600' : 'text-gray-400',
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-primary-700">U</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Usuario</p>
            <p className="text-xs text-gray-500">Plan Gratuito</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile hamburger button ─────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white rounded-xl shadow-md border border-gray-200"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen p-6">
        <NavContent />
      </aside>

      {/* ── Mobile backdrop ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────── */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col p-6',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Menú de navegación"
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <NavContent />
      </aside>
    </>
  );
}
