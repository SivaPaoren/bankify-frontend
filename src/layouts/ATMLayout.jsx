import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navLinkClasses = ({ isActive }) =>
  `block px-4 py-3 rounded-xl text-base font-semibold transition
   ${isActive ? "bg-lime-400 text-black" : "text-zinc-200 hover:bg-zinc-800"}`;

export default function ATMLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/atm-login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold">Bankify ATM</h1>
          <p className="text-xs text-zinc-400">High-contrast kiosk mode</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-100 border border-zinc-700 hover:bg-zinc-800"
        >
          Exit
        </button>
      </header>

      <div className="flex flex-col md:flex-row">
        <aside className="md:w-72 border-b md:border-b-0 md:border-r border-zinc-800 p-4 space-y-2">
          <NavLink to="/atm" end className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/atm/actions" className={navLinkClasses}>
            Transactions
          </NavLink>
          <NavLink to="/atm/history" className={navLinkClasses}>
            History
          </NavLink>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
