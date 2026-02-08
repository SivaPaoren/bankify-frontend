import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ATMDeposit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currency = user?.currency || "THB";
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const userName = user?.name || "User Name";

  const handleDeposit = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) < 1) {
      setError("Please enter an amount greater than 0");
      return;
    }

    setError("");
    setIsLoading(true);

    setTimeout(() => {
      // Update balance
      const currentBalance =
        Number(localStorage.getItem("atm_balance")) || 0;
      const newBalance = currentBalance + Number(amount);
      localStorage.setItem("atm_balance", newBalance);

      // Save transaction
      const tx = {
        type: "Deposit",
        amount: Number(amount),
        currency: currency,
        status: "SUCCESS",
        date: new Date().toISOString(),
      };

      const existing =
        JSON.parse(localStorage.getItem("atm_transactions")) || [];

      localStorage.setItem(
        "atm_transactions",
        JSON.stringify([tx, ...existing])
      );

      setIsLoading(false);
      navigate("/atm");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative text-slate-800">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 px-12 py-8 flex justify-between text-sm text-slate-500">
        <div>{date}</div>
        <div className="font-semibold text-slate-900">{userName}</div>
      </header>

      {/* Card */}
      <div className="bg-white w-full max-w-[480px] rounded-3xl shadow-xl p-8 text-center">

        {/* Top */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-xl font-bold">Deposit</h2>
          <div className="w-8" />
        </div>

        <form onSubmit={handleDeposit} className="space-y-6">

          {/* Amount Input */}
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="w-full p-4 rounded-xl bg-slate-100 outline-none text-center text-4xl font-bold text-slate-800 placeholder:text-slate-300"
            />
            {amount && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                {currency}
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-white transition
              ${isLoading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isLoading ? (
              <span className="flex justify-center gap-2 items-center">
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </span>
            ) : (
              <span className="flex justify-center gap-2 items-center">
                <Check size={20} />
                Confirm Deposit
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
