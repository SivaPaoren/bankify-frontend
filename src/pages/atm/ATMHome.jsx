import { useNavigate } from "react-router-dom";
import bankifyLogo from "../../assets/BankifyWhiteLogo.png";

/* ---------- HARDWARE UI COMPONENTS (Shared) ---------- */

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

const KeyButton = ({ label, color, span = 1 }) => {
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
    <div className={`col-span-${span} relative active:top-[2px] transition-all`}>
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

/* ---------- HOME PAGE COMPONENT ---------- */

export default function ATMHome() {
  const navigate = useNavigate();

  const leftLabels = ["", "Balance", "Transfer", "Exit"];
  const leftActions = [
    null,
    () => navigate("/atm/balance"),
    () => navigate("/atm/transfer"),
    () => navigate("/atm-login")
  ];

  const rightLabels = ["", "Deposit", "Withdraw", "History"];
  const rightActions = [
    null,
    () => navigate("/atm/deposit"),
    () => navigate("/atm/withdraw"),
    () => navigate("/atm/history")
  ];

  const renderCenterScreen = () => {
    return (
      <div className="text-center flex flex-col items-center justify-center h-full w-full">
        <div className="absolute top-4 w-full px-6 flex justify-between items-center text-[10px] text-cyan-600 font-mono border-b border-cyan-900/30 pb-1">
          <span>TERM: #8842</span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <h2 className="text-white text-xl font-bold tracking-wider mb-2 drop-shadow-md">
          SELECT TRANSACTION
        </h2>
        <p className="text-cyan-400 text-xs font-mono mb-8">
          WELCOME BACK
        </p>
      </div>
    );
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

          {/* LEFT UNIT: SCREEN + CASH DISPENSER UNDERNEATH */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700">
              <div className="flex">
                {/* LEFT BUTTONS */}
                <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
                  {leftLabels.map((lbl, i) => (
                    <BezelButton key={i} side="left" onClick={leftActions[i]} disabled={!leftActions[i]} />
                  ))}
                </div>

                {/* SCREEN DISPLAY */}
                <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6 px-2 w-1/3 pointer-events-none z-20">
                    {leftLabels.map((label, i) => (
                      <div key={i} className="h-10 flex items-center justify-start">
                        {label && (
                          <div className="flex items-center gap-1">
                            <span className="text-cyan-400 font-bold">&lt;</span>
                            <span className="bg-slate-800/90 text-white text-xs px-2 py-1.5 rounded border-l-2 border-cyan-500 shadow-lg min-w-[80px]">
                              {label}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="absolute right-0 top-0 h-full flex flex-col justify-between py-6 px-2 w-1/3 pointer-events-none items-end z-20">
                    {rightLabels.map((label, i) => (
                      <div key={i} className="h-10 flex items-center justify-end">
                        {label && (
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-800/90 text-white text-xs px-2 py-1.5 rounded border-r-2 border-cyan-500 shadow-lg text-right min-w-[80px]">
                              {label}
                            </span>
                            <span className="text-cyan-400 font-bold">&gt;</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="w-full h-full flex items-center justify-center p-5 relative z-10">
                    {renderCenterScreen()}
                  </div>
                </div>

                {/* RIGHT BUTTONS */}
                <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
                  {rightLabels.map((lbl, i) => (
                    <BezelButton key={i} side="right" onClick={rightActions[i]} disabled={!rightActions[i]} />
                  ))}
                </div>
              </div>
            </div>

            {/* CASH DISPENSER */}
            <div className="bg-gray-200 p-6 rounded-xl border border-gray-400 shadow-inner flex flex-col items-center">
              <div className="w-full max-w-[400px] h-14 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md border-b-2 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="w-[85%] h-3 bg-black rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
                <div className="absolute top-0 left-0 w-full h-px bg-white/10" />
              </div>
              <div className="text-[12px] text-gray-500 font-extrabold uppercase mt-3 tracking-widest">Cash Dispenser</div>
            </div>
          </div>

          {/* RIGHT UNIT: CARD SLOT, KEYPAD, RECEIPT */}
          <div className="flex flex-col gap-6 w-72">
            <div className="bg-gray-200 p-4 rounded-xl border border-gray-400 shadow-inner relative z-0">
              <div className="h-10 bg-gray-900 rounded relative flex items-center justify-center border-b border-gray-700 z-10">
                <div className="w-16 h-1 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 text-center">Card Inserted</div>
            </div>

            <div className="bg-gray-300 p-4 rounded-xl border shadow-xl">
              <div className="grid grid-cols-4 gap-2">
                <KeyButton label="1" /><KeyButton label="2" /><KeyButton label="3" /><KeyButton label="CANCEL" color="red" />
                <KeyButton label="4" /><KeyButton label="5" /><KeyButton label="6" /><KeyButton label="CLEAR" color="yellow" />
                <KeyButton label="7" /><KeyButton label="8" /><KeyButton label="9" /><KeyButton label="ENTER" color="green" />
                <div /><KeyButton label="0" /><div /><div />
              </div>
            </div>

            {/* RECEIPT SLOT */}
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
