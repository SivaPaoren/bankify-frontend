import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Search,
  Filter,
} from "lucide-react";

export default function ATMHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  // Load transactions from localStorage
  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("atm_transactions")) || [];
    setTransactions(stored);
  }, []);

  // Helper for icon + styles (UI unchanged)
  const getTypeStyles = (type) => {
    switch (type) {
      case "Deposit":
        return {
          icon: <ArrowDownLeft size={16} />,
          color: "text-emerald-600 bg-emerald-100",
          label: "Incoming",
        };
      case "Withdraw":
        return {
          icon: <ArrowUpRight size={16} />,
          color: "text-red-600 bg-red-100",
          label: "Outgoing",
        };
      case "Transfer":
        return {
          icon: <Repeat size={16} />,
          color: "text-blue-600 bg-blue-100",
          label: "Transfer",
        };
      default:
        return {
          icon: null,
          color: "text-slate-600 bg-slate-100",
          label: "Other",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center relative text-slate-800">

      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent -z-10" />

      <div className="w-full max-w-3xl px-6 py-8">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900"
          >
            <div className="p-2 bg-white rounded-full shadow-sm">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium">Back to ATM</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              U
            </div>
            <span className="text-xs font-semibold text-slate-600">
              User Name
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Transaction History</h1>
              <p className="text-sm text-slate-500">
                Review your recent ATM activity.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-xl">
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-xl">
                <Filter size={20} />
              </button>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold">
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-400">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, index) => {
                    const style = getTypeStyles(t.type);
                    const isPositive = t.amount > 0;

                    return (
                      <tr key={index} className="hover:bg-blue-50/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${style.color}`}
                            >
                              {style.icon}
                            </div>
                            <div>
                              <div className="font-semibold capitalize">
                                {t.type}
                              </div>
                              {t.targetAccount && (
                                <div className="text-xs text-slate-400">
                                  To {t.targetAccount}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold">
                            {style.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(t.date).toLocaleString()}
                        </td>

                        <td
                          className={`px-6 py-4 text-right font-bold ${
                            isPositive
                              ? "text-emerald-600"
                              : "text-slate-900"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {Math.abs(t.amount).toLocaleString()} THB
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-6 border-t text-center">
            <button className="text-sm text-slate-500 hover:text-blue-600">
              Load More Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
