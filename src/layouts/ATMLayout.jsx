import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function ATMLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/atm-login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">

          {/* Title */}
          <h1 className="text-xl font-bold tracking-wide">
            BANKIFY ATM
          </h1>

          {/* User + Exit */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs uppercase text-slate-500">
                Logged in as
              </p>
              <p className="font-mono font-bold text-lg text-slate-900">
                {user?.bankId || user?.email || "1234"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide transition"
            >
              <LogOut size={18} />
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto py-10 px-6">
        <Outlet />
      </main>
    </div>
  );
}
