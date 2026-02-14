import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { transactionService } from "../../api";

export default function ATMWithdraw() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currency = user?.currency || "THB";
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const userName = user?.name || "User Name";

  const presetAmounts = [1000, 2000, 5000, 10000];

  const handleWithdraw = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) < 1) {
      setError("Please select or enter an amount");
      return;
    }

    // Check balance if possible, or let backend handle it.
    // Since we are moving to API, we rely on API error for insufficient funds.

    setError("");
    setIsLoading(true);

    setTimeout(async () => {
      try {
        await transactionService.withdraw(amount, "ATM Withdrawal");
        setIsLoading(false);
        navigate("/atm");
      } catch (err) {
        console.error(err);
        setError("Withdrawal failed. Insufficient funds or system error.");
        setIsLoading(false);
      }
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
          <h2 className="text-xl font-bold">Withdraw</h2>
          <div className="w-8" />
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">

          {/* Preset Amount Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {presetAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAmount(val.toString());
                  setError("");
                }}
                className={`py-4 rounded-xl font-semibold transition
                  ${Number(amount) === val
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {val.toLocaleString()} {currency}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Other amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="w-full p-4 rounded-xl bg-slate-100 outline-none text-center text-3xl font-bold text-slate-800 placeholder:text-slate-300"
            />
            {amount && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                {currency}
              </span>
            )}
          </div>


          {/* Error */}
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
                Confirm Withdraw
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
