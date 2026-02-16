import { useState } from "react";
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
    <div className={`h-full w-full rounded shadow-md border-b-4 border-r-2 border-gray-600 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 ${disabled ? "bg-gray-400" : ""}`}></div>
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
    <div className="relative active:translate-y-[2px] transition-all" onClick={onClick}>
      <div className={`h-12 w-full rounded-md border-b-4 border-r-2 ${borderColor} bg-gradient-to-br ${bgGradient} shadow-md flex items-center justify-center font-extrabold cursor-pointer select-none ${textColor} ${label.length > 1 ? "text-[10px] tracking-tighter" : "text-xl"}`}>
        {label}
      </div>
    </div>
  );
};

export default function ATMDeposit() {
  const navigate = useNavigate();
  const [step, setStep] = useState("AMOUNT");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleNumberPress = (num) => {
    setError("");
    if (amount.length < 7) setAmount(prev => prev + num);
  };

  const handleClear = () => { setAmount(""); setError(""); };

  const handleEnter = () => {
    if (step === "AMOUNT") {
      const val = Number(amount);
      if (!amount || val < 1) { setError("MIN DEPOSIT ฿1"); return; }
      if (val > 100000) { setError("MAX DEPOSIT ฿100,000"); return; }
      setStep("CONFIRM");
    } else if (step === "CONFIRM") {
      processDeposit();
    }
  };

  const processDeposit = async () => {
    setStep("PROCESSING");
    try {
      await atmService.deposit(Number(amount), "Cash deposit via ATM");

      // Show success briefly before navigating
      setTimeout(() => {
        navigate("/atm");
      }, 1800);
    } catch (error) {
      console.error("Deposit failed:", error);
      setError(error.response?.data?.message || "Deposit failed. Please try again.");
      setStep("AMOUNT");
    }
  };

  const getBills = (val) => {
    let remain = Number(val);
    const bills = [];
    const denoms = [
      { v: 1000, color: "bg-[#7d6e61]", border: "border-[#4a3f36]" },
      { v: 500, color: "bg-[#9b72b0]", border: "border-[#5e3d70]" },
      { v: 100, color: "bg-[#d14d4d]", border: "border-[#822a2a]" },
      { v: 50, color: "bg-[#4a89cc]", border: "border-[#2a4d73]" },
      { v: 20, color: "bg-[#52a36d]", border: "border-[#2d5c3d]" }
    ];
    denoms.forEach(d => {
      const count = Math.floor(remain / d.v);
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) { bills.push(d); }
        remain %= d.v;
      }
    });
    return bills.reverse();
  };

  const billStack = getBills(amount);

  return (
    <div className="min-h-screen w-full bg-slate-200 flex flex-col items-center justify-center p-4">
      {/* HEADER */}
      <div className="bg-slate-800 w-full max-w-5xl rounded-t-2xl p-4 border-b-8 border-slate-900 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <img src={bankifyLogo} alt="Bankify" className="w-8 h-8" />
          <h1 className="text-2xl text-white font-bold">Bankify</h1>
        </div>
      </div>

      {/* MACHINE BODY */}
      <div className="bg-gradient-to-b from-gray-300 to-gray-400 w-full max-w-5xl p-6 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

          {/* LEFT UNIT */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700">
              <div className="flex">
                <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
                  <BezelButton side="left" disabled />
                  <BezelButton side="left" disabled />
                  <BezelButton side="left" disabled />
                  <BezelButton side="left" onClick={() => step === "AMOUNT" ? navigate("/atm") : setStep("AMOUNT")} />
                </div>

                <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
                  {/* SCREEN LABELS */}
                  <div className="absolute left-0 bottom-6 px-2 z-20">
                    <div className="h-10 flex items-center gap-1">
                      <span className="text-cyan-400 font-bold">&lt;</span>
                      <span className="bg-slate-800/90 text-white text-[10px] px-2 py-1.5 rounded border-l-2 border-cyan-500 min-w-[60px] text-center uppercase">Back</span>
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-6 px-2 z-20">
                    <div className="h-10 flex items-center gap-1">
                      <span className="bg-slate-800/90 text-white text-[10px] px-2 py-1.5 rounded border-r-2 border-cyan-500 min-w-[60px] text-center uppercase">{step === "CONFIRM" ? "Confirm" : "Next"}</span>
                      <span className="text-cyan-400 font-bold">&gt;</span>
                    </div>
                  </div>

                  <div className="w-full h-full flex items-center justify-center p-5 z-10 font-mono">
                    {step === "AMOUNT" && (
                      <div className="text-center">
                        <h2 className="text-cyan-500 text-xs font-bold uppercase mb-2 tracking-widest">Deposit Amount (THB)</h2>
                        <div className="bg-black/40 p-4 rounded border border-slate-700 text-white text-4xl shadow-inner">฿{amount || "0"}</div>
                        {error && <p className="text-red-500 text-[10px] mt-2 uppercase font-bold">{error}</p>}
                      </div>
                    )}
                    {step === "CONFIRM" && (
                      <div className="text-center text-white space-y-2 animate-pulse">
                        <h2 className="text-yellow-500 font-bold mb-4 text-xl uppercase tracking-tighter">Insert THB Cash</h2>
                        <p className="text-4xl text-green-400 font-bold tracking-tight">฿{amount}.00</p>
                      </div>
                    )}
                    {step === "PROCESSING" && (
                      <div className="text-center space-y-4 text-white text-xs">
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="animate-pulse tracking-widest uppercase">Validating Baht...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
                  <BezelButton side="right" disabled /><BezelButton side="right" disabled /><BezelButton side="right" disabled />
                  <BezelButton side="right" onClick={handleEnter} />
                </div>
              </div>
            </div>

            {/* DEPOSIT SLOT */}
            <div className="bg-gray-200 p-6 rounded-xl border border-gray-400 shadow-inner flex flex-col items-center">
              <div className="w-full max-w-[400px] h-16 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md border-b-2 border-gray-600 flex items-center justify-center relative overflow-visible shadow-2xl">

                <div
                  className={`absolute w-40 h-10 transition-all duration-[1000ms] ease-in-out
                    ${step === 'CONFIRM' ? 'translate-y-[-20px] opacity-100 z-30' : 'translate-y-20 opacity-0 z-0'}
                    ${step === 'PROCESSING' ? 'translate-y-0 opacity-0 scale-90 z-0' : ''}
                  `}
                >
                  {billStack.map((bill, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 ${bill.color} ${bill.border} rounded border shadow-xl flex items-center justify-between px-2 text-[8px] text-white font-black`}
                      style={{
                        transform: `translateY(-${index * 2}px) rotate(${index % 2 === 0 ? 0.5 : -0.5}deg)`,
                      }}
                    >
                      <span className="opacity-50">฿</span>
                      <span>{bill.v}</span>
                      <div className="w-8 h-4 border border-white/10 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white/5" />
                      </div>
                      <span>{bill.v}</span>
                      <span className="opacity-50">฿</span>
                    </div>
                  ))}
                </div>

                <div className={`w-[85%] h-3 bg-black rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] z-10 ${step === 'CONFIRM' ? 'ring-2 ring-green-500' : ''}`} />
              </div>
              <div className="text-[12px] text-gray-500 font-extrabold uppercase mt-3 tracking-widest">THB Deposit Slot</div>
            </div>
          </div>

          {/* RIGHT UNIT: CARD, KEYPAD, RECEIPT SLOT */}
          <div className="flex flex-col gap-6 w-72">
            <div className="bg-gray-200 p-4 rounded-xl border border-gray-400 shadow-inner">
              <div className="h-10 bg-gray-900 rounded relative flex items-center justify-center border-b border-gray-700">
                <div className="w-16 h-1 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 text-center">Card Inserted</div>
            </div>

            <div className="bg-gray-300 p-4 rounded-xl border-2 border-gray-400 shadow-xl">
              <div className="grid grid-cols-4 gap-2">
                <KeyButton label="1" onClick={() => handleNumberPress("1")} />
                <KeyButton label="2" onClick={() => handleNumberPress("2")} />
                <KeyButton label="3" onClick={() => handleNumberPress("3")} />
                <KeyButton label="CANCEL" color="red" onClick={() => navigate("/atm")} />
                <KeyButton label="4" onClick={() => handleNumberPress("4")} />
                <KeyButton label="5" onClick={() => handleNumberPress("5")} />
                <KeyButton label="6" onClick={() => handleNumberPress("6")} />
                <KeyButton label="CLEAR" color="yellow" onClick={handleClear} />
                <KeyButton label="7" onClick={() => handleNumberPress("7")} />
                <KeyButton label="8" onClick={() => handleNumberPress("8")} />
                <KeyButton label="9" onClick={() => handleNumberPress("9")} />
                <KeyButton label="ENTER" color="green" onClick={handleEnter} />
                <div className="invisible" /><KeyButton label="0" onClick={() => handleNumberPress("0")} /><div className="invisible" /><div className="invisible" />
              </div>
            </div>

            {/* UPDATED RECEIPT MODULE (h-32) */}
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