import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ATMHome() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from context

  // Mock header data
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const userName = user?.name || "User Name";
  const accountNumber = user?.accountNumber || "**** 1234";
  const currency = user?.currency || "THB";

  const [balance, setBalance] = useState(123432.42);
  const [transactions, setTransactions] = useState([]);

  // Load balance + transactions from localStorage
  useEffect(() => {
    const storedBalance = localStorage.getItem("atm_balance");
    const storedTx = localStorage.getItem("atm_transactions");

    if (storedBalance) {
      setBalance(Number(storedBalance));
    } else {
      localStorage.setItem("atm_balance", balance);
    }

    if (storedTx) {
      setTransactions(JSON.parse(storedTx));
    }
  }, []);

  // Get last 3 transactions (latest first)
  const lastThree = transactions.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative text-slate-800">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 px-12 py-8 flex justify-between text-sm text-slate-500">
        <div>{date}</div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-900">
            Welcome, {userName}
          </p>
          <p>{accountNumber}</p>
        </div>
      </header>

      {/* Main Card */}
      <div className="bg-white w-full max-w-[520px] rounded-3xl shadow-xl px-12 py-14 text-center">

        {/* Balance */}
        <p className="text-slate-500 uppercase tracking-widest text-sm mb-2">
          Balance
        </p>
        <p className="text-5xl font-extrabold text-slate-900 mb-10">
          {balance.toLocaleString()} {currency}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => navigate("/atm/deposit")}
            className="py-4 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-md"
          >
            Deposit
          </button>

          <button
            onClick={() => navigate("/atm/withdraw")}
            className="py-4 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-md"
          >
            Withdraw
          </button>

          <button
            onClick={() => navigate("/atm/transfer")}
            className="py-4 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition shadow-md"
          >
            Transfer
          </button>
        </div>

        {/* Last 3 Transactions */}
        <div className="mt-8 text-left">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">
            Last 3 Transactions
          </h3>

          {lastThree.length === 0 ? (
            <p className="text-sm text-slate-400">
              No recent transactions
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lastThree.map((tx, index) => (
                <li
                  key={index}
                  className="flex justify-between text-slate-700"
                >
                  <span>
                    {tx.type}
                  </span>
                  <span
                    className={
                      tx.amount > 0
                        ? "text-emerald-600 font-semibold"
                        : "text-red-500 font-semibold"
                    }
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount.toLocaleString()} {tx.currency || currency}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* History link */}
        <button
          onClick={() => navigate("/atm/history")}
          className="mt-6 w-full text-sm text-slate-500 hover:text-slate-900 hover:underline"
        >
          View Transaction History
        </button>
      </div>

      {/* Exit */}
      <button
        onClick={() => navigate("/atm-login")}
        className="absolute bottom-8 left-12 text-sm text-slate-600 hover:underline"
      >
        Exit
      </button>
    </div>
  );
}
