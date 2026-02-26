import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bankifyLogo from "../../assets/BankifyWhiteLogo.png";
import { atmService } from "../../api";

/* ---------- SHARED HARDWARE UI COMPONENTS ---------- */

const BezelButton = ({ onClick, disabled, side }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`
      relative w-12 h-10 transition-all duration-100 ease-out z-20
      flex items-center justify-center
      ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95 active:brightness-90 cursor-pointer"}
    `}
  >
    <div className={`h-full w-full rounded shadow-md border-b-4 border-r-2 border-gray-600 bg-linear-to-br from-gray-200 via-gray-300 to-gray-400 ${disabled ? "bg-gray-400" : ""}`}></div>
    <div className={`absolute top-1/2 -translate-y-1/2 h-1.5 w-4 bg-gray-500 z-[-1] ${side === "left" ? "-right-3" : "-left-3"} shadow-sm`} />
  </button>
);

const KeyButton = ({ label, color, onClick }) => {
  let bgGradient = "from-gray-100 to-gray-300";
  let borderColor = "border-gray-400";
  let textColor = "text-gray-800";
  if (color === "red") { bgGradient = "from-red-600 to-red-800"; borderColor = "border-red-900"; textColor = "text-white"; }
  else if (color === "yellow") { bgGradient = "from-yellow-400 to-yellow-600"; borderColor = "border-yellow-800"; textColor = "text-black"; }
  else if (color === "green") { bgGradient = "from-green-600 to-green-800"; borderColor = "border-green-900"; textColor = "text-white"; }

  return (
    <div className="relative active:translate-y-0.5 transition-all" onClick={onClick}>
      <div className={`h-12 w-full rounded-md border-b-4 border-r-2 ${borderColor} bg-linear-to-br ${bgGradient} shadow-md flex items-center justify-center font-extrabold cursor-pointer select-none ${textColor} ${label.length > 1 ? "text-[10px] tracking-tighter" : "text-xl"}`}>
        {label}
      </div>
    </div>
  );
};

export default function ATMHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await atmService.getTransactions();
        // Response may be { content: [...] } or [...] directly
        const txs = response.content || response || [];
        setTransactions(txs.slice(0, 10)); // Show recent 10
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-200 flex flex-col items-center justify-center p-4">
      {/* ATM HEADER */}
      <div className="bg-slate-800 w-full max-w-5xl rounded-t-2xl p-4 border-b-8 border-slate-900 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <img src={bankifyLogo} alt="Bankify" className="w-8 h-8" />
          <h1 className="text-2xl text-white font-bold">Bankify</h1>
        </div>
      </div>

      {/* MACHINE BODY */}
      <div className="bg-linear-to-b from-gray-300 to-gray-400 w-full max-w-5xl p-6 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

          {/* LEFT UNIT */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700">
              <div className="flex">
                <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
                  <BezelButton side="left" disabled /><BezelButton side="left" disabled /><BezelButton side="left" disabled />
                  <BezelButton side="left" onClick={() => navigate("/atm")} />
                </div>

                {/* SCREEN DISPLAY */}
                <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
                  <div className="absolute left-0 bottom-6 px-2 z-20">
                    <div className="h-10 flex items-center gap-1">
                      <span className="text-cyan-400 font-bold">&lt;</span>
                      <span className="bg-slate-800/90 text-white text-[10px] px-2 py-1.5 rounded border-l-2 border-cyan-500 min-w-[60px] text-center uppercase">Back</span>
                    </div>
                  </div>

                  <div className="w-full h-full p-6 font-mono text-white flex flex-col">
                    <h2 className="text-cyan-500 text-xs font-bold uppercase mb-4 tracking-widest text-center border-b border-cyan-900/50 pb-2">Last 3 Transactions</h2>

                    <div className="flex-1 overflow-hidden pr-2">
                      <table className="w-full text-[10px] uppercase">
                        <tbody className="divide-y divide-slate-800">
                          {transactions.length === 0 ? (
                            <tr><td className="py-12 text-center text-slate-600 tracking-widest">No Records Found</td></tr>
                          ) : (
                            transactions.map((t, i) => (
                              <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                <td className={`py-5 ${t.amount > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                  {t.type} <br />
                                  <span className="text-[8px] text-slate-500">{new Date(t.createdAt).toLocaleString()}</span>
                                </td>
                                <td className="py-5 text-right font-bold text-lg tracking-tighter">
                                  {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} ฿
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
                  <BezelButton side="right" disabled /><BezelButton side="right" disabled /><BezelButton side="right" disabled /><BezelButton side="right" disabled />
                </div>
              </div>
            </div>

            <div className="bg-gray-200 p-6 rounded-xl border border-gray-400 shadow-inner flex flex-col items-center">
              <div className="w-full max-w-[400px] h-16 bg-linear-to-b from-gray-900 to-gray-800 rounded-md border-b-2 border-gray-600 flex items-center justify-center relative shadow-2xl">
                <div className="w-[85%] h-3 bg-black rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
              </div>
              <div className="text-[12px] text-gray-500 font-extrabold uppercase mt-3 tracking-widest">Cash Slot</div>
            </div>
          </div>

          {/* RIGHT UNIT */}
          <div className="flex flex-col gap-6 w-72">
            <div className="bg-gray-200 p-4 rounded-xl border border-gray-400 shadow-inner">
              <div className="h-10 bg-gray-900 rounded relative flex items-center justify-center">
                <div className="w-16 h-1 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 text-center tracking-tighter">Card Inserted</div>
            </div>

            <div className="bg-gray-300 p-4 rounded-xl border-2 border-gray-400 shadow-xl">
              <div className="grid grid-cols-4 gap-2">
                <KeyButton label="1" /><KeyButton label="2" /><KeyButton label="3" />
                <KeyButton label="CANCEL" color="red" onClick={() => navigate("/atm")} />
                <KeyButton label="4" /><KeyButton label="5" /><KeyButton label="6" /><KeyButton label="CLEAR" color="yellow" />
                <KeyButton label="7" /><KeyButton label="8" /><KeyButton label="9" /><KeyButton label="ENTER" color="green" />
                <div className="invisible" /><KeyButton label="0" /><div className="invisible" /><div className="invisible" />
              </div>
            </div>

            {/* CORRECTED RECEIPT SLOT (Matches h-32 size from Home/Transfer) */}
            <div className="bg-gray-200 p-3 rounded-lg border border-gray-400 shadow-inner flex flex-col items-center justify-center h-32">
              <div className="w-3/4 h-1.5 bg-gray-900 rounded-full mb-2 border-b border-white/10 shadow-inner" />
              <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest">Receipt</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}