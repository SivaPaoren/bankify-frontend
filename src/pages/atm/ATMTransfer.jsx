import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export default function ATMTransfer() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const date = "24 January 2026";
  const userName = "User Name";

  const handleTransfer = (e) => {
    e.preventDefault();

    if (!targetAccount) {
      setError("Please enter target account number");
      return;
    }

    if (!amount || Number(amount) < 1) {
      setError("Please enter an amount greater than 0");
      return;
    }

    const currentBalance =
      Number(localStorage.getItem("atm_balance")) || 0;

    if (Number(amount) > currentBalance) {
      setError("Insufficient balance");
      return;
    }

    setError("");
    setIsLoading(true);

    setTimeout(() => {
      // Update balance
      const newBalance = currentBalance - Number(amount);
      localStorage.setItem("atm_balance", newBalance);

      // Save transaction
      const tx = {
        type: "Transfer",
        amount: -Number(amount),
        targetAccount,
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
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center relative text-slate-800">

      {/* Header (unchanged) */}
      <header className="absolute top-0 left-0 right-0 px-12 py-8 flex justify-between text-sm text-slate-500">
        <div>{date}</div>
        <div className="font-semibold text-slate-900">{userName}</div>
      </header>

      {/* Card (unchanged UI) */}
      <div className="bg-white w-full max-w-[480px] rounded-3xl shadow-xl p-8 text-center">

        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-xl font-bold">Transfer</h2>
          <div className="w-8" />
        </div>

        <form onSubmit={handleTransfer} className="space-y-6">

          <input
            type="text"
            placeholder="Target Account Number"
            value={targetAccount}
            onChange={(e) => {
              setTargetAccount(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-xl bg-slate-100 outline-none"
          />

          <input
            type="text"
            inputMode="numeric"
            placeholder="Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            className="w-full p-3 rounded-xl bg-slate-100 outline-none"
          />

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-white transition
              ${
                isLoading
                  ? "bg-slate-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isLoading ? (
              <span className="flex justify-center gap-2 items-center">
                <Loader2 className="animate-spin" size={20} />
                Processing
              </span>
            ) : (
              <span className="flex justify-center gap-2 items-center">
                <Check size={20} />
                Confirm Transfer
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
