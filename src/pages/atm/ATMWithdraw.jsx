import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

export default function ATMWithdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const date = "24 January 2026";
  const userName = "User Name";

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/atm");
    }, 1500);
  };

  const addQuickAmount = (val) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center relative text-slate-800">

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

        {/* Amount */}
        <form onSubmit={handleWithdraw}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full text-center text-5xl font-bold mb-8 bg-transparent outline-none"
          />

          {/* Quick buttons */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[500, 1000, 2000, 5000, 10000, 20000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => addQuickAmount(val)}
                className="py-2 rounded-xl bg-slate-100 font-semibold hover:bg-slate-200"
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!amount || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-white transition
              ${
                isLoading
                  ? "bg-slate-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isLoading ? (
              <span className="flex justify-center gap-2">
                <Loader2 className="animate-spin" /> Processing
              </span>
            ) : (
              <span className="flex justify-center gap-2">
                <Check /> Confirm Withdraw
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
