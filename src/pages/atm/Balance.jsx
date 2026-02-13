import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bankifyLogo from "../../assets/BankifyLogo.png";

/* ---------- HARDWARE UI COMPONENTS ---------- */

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
      bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400
      ${disabled ? "bg-gray-400" : ""}
    `}></div>

    <div className={`
      absolute top-1/2 -translate-y-1/2 h-1.5 w-4 bg-gray-500 z-[-1]
      ${side === "left" ? "-right-3" : "-left-3"}
      shadow-sm
    `} />
  </button>
);

const KeyButton = ({ label, color, span = 1, onClick }) => {
  let bgGradient = "from-gray-100 to-gray-300";
  let borderColor = "border-gray-400";
  let textColor = "text-gray-800";
  let hoverColor = "hover:brightness-110";

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

  const fontSize =
    label.length > 1
      ? "text-[10px] font-bold tracking-wider"
      : "text-xl font-bold";

  return (
    <div className={`col-span-${span} relative active:top-[2px] transition-all`} onClick={onClick}>
      <div
        className={`
          h-12 rounded-md border-b-4 border-r-2 ${borderColor}
          bg-gradient-to-br ${bgGradient} ${hoverColor} shadow-sm
          flex items-center justify-center ${fontSize} ${textColor}
          cursor-pointer select-none
        `}
      >
        {label}
      </div>
    </div>
  );
};

/* ---------- BALANCE PAGE COMPONENT ---------- */

export default function ATMBalance() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Initializing with a balance if none exists
    const stored = localStorage.getItem("atm_balance") || "12500";
    setBalance(Number(stored));
  }, []);

  const handlePrintAndExit = () => {
    setIsExiting(true);
    // The receipt prints as part of the exit/logout sequence
    setIsPrinting(true); 
    
    // Hold on the "Thank You" screen for 4.5 seconds then return to login
    setTimeout(() => {
      navigate("/atm-login");
    }, 4500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-200 flex flex-col items-center justify-center p-4">

      {/* ATM HEADER */}
      <div className="bg-slate-800 w-full max-w-5xl rounded-t-2xl p-4 shadow-2xl border-b-8 border-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={bankifyLogo} alt="Bankify" className="w-8 h-8" />
          <h1 className="text-2xl text-white font-bold">Bankify</h1>
        </div>
      </div>

      {/* MACHINE BODY */}
      <div className="bg-gradient-to-b from-gray-300 to-gray-400 w-full max-w-5xl p-6 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

          {/* LEFT UNIT: SCREEN + CASH DISPENSER */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700">
              <div className="flex">
                {/* LEFT BUTTONS */}
                <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
                  <BezelButton side="left" disabled />
                  <BezelButton side="left" disabled />
                  <BezelButton side="left" disabled />
                  <BezelButton side="left" onClick={() => navigate("/atm")} disabled={isExiting} />
                </div>

                {/* SCREEN DISPLAY */}
                <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden font-mono text-white">
                  {!isExiting ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <div className="text-cyan-600 text-[10px] tracking-[0.3em] uppercase mb-4">Account Inquiry</div>
                      <div className="text-5xl font-black mb-2 tracking-tighter drop-shadow-md">
                        ฿{balance.toLocaleString()}
                      </div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold">Available Balance</div>
                      
                      {/* Screen Navigation Labels */}
                      <div className="absolute left-0 bottom-6 px-2">
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400 font-bold">&lt;</span>
                          <span className="bg-slate-800 px-2 py-1.5 rounded text-[10px] uppercase border-l border-cyan-500 shadow-md">Back</span>
                        </div>
                      </div>
                      <div className="absolute right-0 bottom-6 px-2">
                        <div className="flex items-center gap-1">
                          <span className="bg-slate-800 px-2 py-1.5 rounded border-r-2 border-emerald-500 min-w-[100px] text-center text-[10px] uppercase shadow-md">Print & Exit</span>
                          <span className="text-emerald-400 font-bold">&gt;</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                      <h2 className="text-emerald-500 text-2xl font-black mb-2 animate-pulse tracking-widest">THANK YOU</h2>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Please take your card and receipt</p>
                      <div className="mt-8 w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[loading_4s_ease-in-out]" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT BUTTONS */}
                <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
                  <BezelButton side="right" disabled />
                  <BezelButton side="right" disabled />
                  <BezelButton side="right" disabled />
                  <BezelButton side="right" onClick={handlePrintAndExit} disabled={isExiting} />
                </div>
              </div>
            </div>

            {/* CASH DISPENSER */}
            <div className="bg-gray-200 p-6 rounded-xl border border-gray-400 shadow-inner flex flex-col items-center">
              <div className="w-full max-w-[400px] h-14 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md border-b-2 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="w-[85%] h-3 bg-black rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
              </div>
              <div className="text-[12px] text-gray-500 font-extrabold uppercase mt-3 tracking-widest">Cash Dispenser</div>
            </div>
          </div>

          {/* RIGHT UNIT: CARD SLOT, KEYPAD, RECEIPT */}
          <div className="flex flex-col gap-6 w-72">
            <div className="bg-gray-200 p-4 rounded-xl border border-gray-400 shadow-inner">
              <div className="h-10 bg-gray-900 rounded relative flex items-center justify-center border-b border-gray-700">
                <div className={`w-16 h-1 shadow-[0_0_8px] animate-pulse ${isExiting ? "bg-red-500 shadow-red-500" : "bg-green-500 shadow-green-500"}`} />
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 text-center">
                {isExiting ? "Ejecting Card..." : "Card Inserted"}
              </div>
            </div>

            <div className="bg-gray-300 p-4 rounded-xl border shadow-xl">
              <div className="grid grid-cols-4 gap-2">
                <KeyButton label="1" /><KeyButton label="2" /><KeyButton label="3" /><KeyButton label="CANCEL" color="red" onClick={() => navigate("/atm")} />
                <KeyButton label="4" /><KeyButton label="5" /><KeyButton label="6" /><KeyButton label="CLEAR" color="yellow" />
                <KeyButton label="7" /><KeyButton label="8" /><KeyButton label="9" /><KeyButton label="ENTER" color="green" />
                <div /><KeyButton label="0" /><div /><div />
              </div>
            </div>

             {/* RECEIPT SLOT (SIZE h-32) */}
             <div className="bg-gray-200 p-3 rounded-lg border border-gray-400 shadow-inner flex flex-col items-center justify-center h-32 relative overflow-hidden">
                {/* Physical Receipt Paper Animation */}
                <div 
                  className={`
                    absolute left-1/2 -translate-x-1/2 w-4/5 bg-white border border-gray-300 shadow-lg
                    transition-all duration-[2500ms] ease-out p-3 z-0
                    ${isPrinting ? "top-2 h-40" : "-top-64 h-0"}
                  `}
                >
                  <div className="text-[6px] text-black font-mono leading-tight">
                    <p className="font-bold border-b border-black/20 pb-1 mb-2 text-center">BANKIFY RECEIPT</p>
                    <div className="flex justify-between mb-1">
                      <span>TYPE:</span>
                      <span>BAL INQUIRY</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>BALANCE:</span>
                      <span>฿{balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>DATE:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <p className="mt-4 text-[5px] text-center opacity-60">PLEASE TAKE YOUR RECEIPT</p>
                  </div>
                </div>

                <div className="w-3/4 h-1.5 bg-gray-900 rounded-full mb-2 border-b border-white/10 shadow-inner z-10" />
                <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest z-10 bg-gray-200 px-2">Receipt</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}