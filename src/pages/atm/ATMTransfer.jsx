import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { atmService } from "../../api";

/* ---------- SHARED HARDWARE UI COMPONENTS ---------- */

const BezelButton = ({ onClick, disabled, side }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`
      relative w-12 h-10 transition-all duration-100 ease-out z-20
      flex items-center justify-center
      ${disabled
        ? "opacity-50 cursor-not-allowed"
        : "active:scale-95 active:brightness-90 cursor-pointer"}
    `}
  >
    <div className={`
      h-full w-full rounded shadow-md border-b-4 border-r-2 border-gray-600
      bg-linear-to-br from-gray-200 via-gray-300 to-gray-400
      ${disabled ? "bg-gray-400" : ""}
    `}></div>
    <div className={`
      absolute top-1/2 -translate-y-1/2 h-1.5 w-4 bg-gray-500 z-[-1]
      ${side === "left" ? "-right-3" : "-left-3"}
      shadow-sm
    `} />
  </button>
);

const KeyButton = ({ label, color, onClick }) => {
  let bgGradient = "from-gray-100 to-gray-300";
  let borderColor = "border-gray-400";
  let textColor = "text-gray-800";

  if (color === "red") {
    bgGradient = "from-red-600 to-red-800";
    borderColor = "border-red-900";
    textColor = "text-white";
  } else if (color === "yellow") {
    bgGradient = "from-yellow-400 to-yellow-600";
    borderColor = "border-yellow-800";
    textColor = "text-black";
  } else if (color === "green") {
    bgGradient = "from-green-600 to-green-800";
    borderColor = "border-green-900";
    textColor = "text-white";
  }

  const labelStyle = label.length > 1 ? "text-[10px] tracking-tighter" : "text-xl";

  return (
    <div className="relative active:translate-y-0.5 transition-all" onClick={onClick}>
      <div className={`
        h-12 w-full rounded-md border-b-4 border-r-2 ${borderColor} 
        bg-linear-to-br ${bgGradient} shadow-md 
        flex items-center justify-center font-extrabold cursor-pointer select-none 
        ${textColor} ${labelStyle}
      `}>
        {label}
      </div>
    </div>
  );
};

export default function ATMTransfer() {
  const navigate = useNavigate();
  const [step, setStep] = useState("ACCOUNT");
  const [targetAccount, setTargetAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleNumberPress = (num) => {
    setError("");
    if (step === "ACCOUNT" && targetAccount.length < 12) setTargetAccount(prev => prev + num);
    if (step === "AMOUNT" && amount.length < 7) setAmount(prev => prev + num);
  };

  const handleClear = () => {
    if (step === "ACCOUNT") setTargetAccount("");
    if (step === "AMOUNT") setAmount("");
    setError("");
  };

  const handleEnter = async () => {
    if (step === "ACCOUNT") {
      if (targetAccount.length < 4) { setError("INVALID ACCOUNT"); return; }
      setStep("AMOUNT");
    } else if (step === "AMOUNT") {
      if (!amount || Number(amount) <= 0) { setError("INVALID AMOUNT"); return; }
      setStep("CONFIRM");
    } else if (step === "CONFIRM") {
      await processTransfer();
    }
  };

  const processTransfer = async () => {
    setStep("PROCESSING");
    try {
      await atmService.transfer(targetAccount, Number(amount), "ATM Transfer");

      // Brief delay then navigate
      setTimeout(() => {
        navigate("/atm");
      }, 1800);
    } catch (error) {
      console.error("Transfer failed:", error);
      setError(error.response?.data?.message || "Transfer failed");
      setStep("AMOUNT");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-200 flex flex-col items-center justify-center p-4">

      {/* ATM HEADER */}
      <div className="bg-slate-800 w-full max-w-5xl rounded-t-2xl p-4 border-b-8 border-slate-900 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <img 
            src={`${import.meta.env.BASE_URL}BankifyLogo.png`} 
            alt="Bankify Logo" 
            className="w-8 h-8" 
          />
          <h1 className="text-2xl text-white font-bold">Bankify</h1>
        </div>
      </div>

      {/* MACHINE BODY */}
      <div className="bg-linear-to-b from-gray-300 to-gray-400 w-full max-w-5xl p-6 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

          {/* LEFT UNIT: SCREEN + DISPENSER */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700">
              <div className="flex">
                <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
                  <BezelButton side="left" disabled={true} />
                  <BezelButton side="left" disabled={true} />
                  <BezelButton side="left" disabled={true} />
                  <BezelButton side="left" onClick={() => step === "ACCOUNT" ? navigate("/atm") : setStep("ACCOUNT")} />
                </div>

                {/* SCREEN DISPLAY */}
                <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
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
                    {step === "ACCOUNT" && (
                      <div className="text-center">
                        <h2 className="text-cyan-500 text-xs font-bold uppercase mb-2 tracking-widest">Target Account</h2>
                        <div className="bg-black/40 p-4 rounded border border-slate-700 text-white text-2xl tracking-widest min-w-60">
                          {targetAccount || "________"}
                        </div>
                        {error && <p className="text-red-500 text-[10px] mt-2 uppercase">{error}</p>}
                      </div>
                    )}
                    {step === "AMOUNT" && (
                      <div className="text-center">
                        <h2 className="text-cyan-500 text-xs font-bold uppercase mb-2 tracking-widest">Enter Amount</h2>
                        <div className="bg-black/40 p-4 rounded border border-slate-700 text-white text-3xl font-bold">฿{amount || "0"}</div>
                        {error && <p className="text-red-500 text-[10px] mt-2 uppercase">{error}</p>}
                      </div>
                    )}
                    {step === "CONFIRM" && (
                      <div className="text-center text-white space-y-2">
                        <h2 className="text-yellow-500 font-bold mb-4 text-xl uppercase tracking-widest">Confirm?</h2>
                        <p className="text-[10px] opacity-70 uppercase tracking-tighter">Transfer to: {targetAccount}</p>
                        <p className="text-3xl text-green-400 font-bold">฿{amount}.00</p>
                      </div>
                    )}
                    {step === "PROCESSING" && (
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-white text-xs animate-pulse tracking-widest uppercase">Processing...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
                  <BezelButton side="right" disabled={true} />
                  <BezelButton side="right" disabled={true} />
                  <BezelButton side="right" disabled={true} />
                  <BezelButton side="right" onClick={handleEnter} />
                </div>
              </div>
            </div>

            {/* CASH DISPENSER */}
            <div className="bg-gray-200 p-6 rounded-xl border border-gray-400 shadow-inner flex flex-col items-center">
              <div className="w-full max-w-[400px] h-14 bg-linear-to-b from-gray-900 to-gray-800 rounded-md border-b-2 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="w-[85%] h-3 bg-black rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
              </div>
              <div className="text-[12px] text-gray-500 font-extrabold uppercase mt-3 tracking-widest">Cash Dispenser</div>
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

            {/* CLEAN RECEIPT SLOT (Matches Home h-32 size) */}
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