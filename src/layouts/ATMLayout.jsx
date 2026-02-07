import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function ATMLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/atm-login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-primary-600 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wider">BANKIFY ATM</h1>
            <p className="text-primary-100 text-sm">Terminal #TRM-001</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs uppercase opacity-70">Logged in as</p>
              <p className="font-mono font-bold text-lg">{user?.bankId || user?.email || 'N/A'}</p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-colors shadow-md"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
