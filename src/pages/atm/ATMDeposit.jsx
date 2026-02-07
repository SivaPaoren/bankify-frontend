import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export default function ATMDeposit() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const date = "24 January 2026";
  const userName = "User Name";

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 1) return;

    setIsLoading(true);

    setTimeout(() => {
      const currentBalance = Number(localStorage.getItem("atm_balance")) || 0;
      const newBalance = currentBalance + Number(amount);

      localStorage.setItem("atm_balance", newBalance);

      setIsLoading(false);
      navigate("/atm");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative text-slate-800">

      <header className="absolute top-0 left-0 right-0 px-12 py-8 flex justify-between text-sm text-slate-500">
        <div>{date}</div>
        <div className="font-semibold text-slate-900">{userName}</div>
      </header>

      <div className="bg-white w-full max-w-[480px] rounded-3xl shadow-xl p-8 text-center">

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

          <input
            type="text"
            inputMode="numeric"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            className="w-full p-4 rounded-xl bg-slate-100 outline-none text-center text-4xl font-bold"
          />

          <button
            type="submit"
            disabled={!amount || Number(amount) < 1 || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-white transition
              ${
                isLoading
                  ? "bg-slate-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isLoading ? (
              <span className="flex justify-center gap-2">
                <Loader2 className="animate-spin" />
                Processing
              </span>
            ) : (
              <span className="flex justify-center gap-2">
                <Check />
                Confirm Deposit
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
