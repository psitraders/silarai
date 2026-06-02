import { Bell, Menu, Search } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
