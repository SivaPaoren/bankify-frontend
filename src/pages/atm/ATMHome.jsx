import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ATMHome() {
  const navigate = useNavigate();

  const date = "24 January 2026";
  const userName = "User Name";
  const accountNumber = "**** 1234";

  const [balance, setBalance] = useState(123432.42);

  useEffect(() => {
    const storedBalance = localStorage.getItem("atm_balance");
    if (storedBalance) {
      setBalance(Number(storedBalance));
    } else {
      localStorage.setItem("atm_balance", balance);
    }
  }, []);

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

      {/* Card */}
      <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-xl p-12 text-center">

        <div className="text-slate-500 uppercase tracking-widest text-sm mb-2">
          Balance
        </div>

        <div className="text-5xl font-bold text-slate-900 mb-10">
          {balance.toLocaleString()} THB
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
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
            className="col-span-2 py-4 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
          >
            Transfer
          </button>
        </div>

        <button
          onClick={() => navigate("/atm/history")}
          className="mt-6 w-full text-sm text-slate-500 hover:text-slate-900 hover:underline"
        >
          View Transaction History
        </button>
      </div>

      <button
        onClick={() => navigate("/atm-login")}
        className="absolute bottom-8 left-12 text-sm text-slate-600 hover:underline"
      >
        Exit
      </button>
    </div>
  );
}
