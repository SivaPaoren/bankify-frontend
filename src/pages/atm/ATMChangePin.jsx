import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bankifyLogo from "../../assets/BankifyWhiteLogo.png";

const BezelButton = ({ onClick, disabled, side }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`relative w-12 h-10 transition-all duration-100 ease-out z-20 flex items-center justify-center ${
      disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95 active:brightness-90 cursor-pointer"
    }`}
  >
    <div className={`h-full w-full rounded shadow-md border-b-4 border-r-2 border-gray-600 bg-linear-to-br from-gray-200 via-gray-300 to-gray-400`} />
    <div className={`absolute top-1/2 -translate-y-1/2 h-1.5 w-4 bg-gray-500 z-[-1] ${side === "left" ? "-right-3" : "-left-3"} shadow-sm`} />
  </button>
);

const KeyButton = ({ label, color, span = 1, onClick }) => {
  let bgGradient = "from-gray-100 to-gray-300";
  let borderColor = "border-gray-400";
  let textColor = "text-gray-800";
  if (color === "red") { bgGradient = "from-red-600 to-red-800"; borderColor = "border-red-900"; textColor = "text-white"; }
  else if (color === "yellow") { bgGradient = "from-yellow-400 to-yellow-600"; borderColor = "border-yellow-800"; textColor = "text-black"; }
  else if (color === "green") { bgGradient = "from-green-600 to-green-800"; borderColor = "border-green-900"; textColor = "text-white"; }

  return (
    <div className={`col-span-${span} relative active:top-0.5 transition-all`} onClick={onClick}>
      <div className={`h-12 rounded-md border-b-4 border-r-2 ${borderColor} bg-linear-to-br ${bgGradient} hover:brightness-110 shadow-sm flex items-center justify-center font-bold cursor-pointer select-none ${label.length > 1 ? "text-[10px] tracking-wider" : "text-xl"} ${textColor}`}>
        {label}
      </div>
    </div>
  );
};

/* ---------- LOGIC COMPONENT ---------- */

export default function ATMChangePin() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("NEW_PIN"); // NEW_PIN -> CONFIRM_PIN
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const pressNumber = (n) => {
    setError("");
    if (stage === "NEW_PIN" && pin.length < 6) setPin((p) => p + n);
    if (stage === "CONFIRM_PIN" && confirmPin.length < 6) setConfirmPin((p) => p + n);
  };

  const clear = () => {
    if (stage === "NEW_PIN") setPin("");
    else setConfirmPin("");
    setError("");
  };

  const handleEnter = () => {
    if (stage === "NEW_PIN") {
      if (pin.length !== 6) {
        setError("PIN must be 6 digits");
        return;
      }
      setStage("CONFIRM_PIN");
      return;
    }

    if (stage === "CONFIRM_PIN") {
      if (pin !== confirmPin) {
        setError("PINs do not match");
        setConfirmPin("");
        return;
      }
      // Success logic
      navigate("/atm");
    }
  };

  // Bezel configuration
  const leftLabels = ["", "", "", "Back"];
  const leftActions = [null, null, null, () => stage === "CONFIRM_PIN" ? setStage("NEW_PIN") : navigate("/atm")];
  const rightLabels = ["", "", "", "Confirm"];
  const rightActions = [null, null, null, handleEnter];

  const renderCenterScreen = () => (
    <div className="text-center w-full max-w-xs">
      <h2 className="text-white text-lg font-bold mb-2 tracking-widest">SECURITY UPDATE</h2>
      <p className="text-cyan-500 text-[10px] font-bold uppercase mb-4">
        {stage === "NEW_PIN" ? "Enter New 6-Digit PIN" : "Confirm New PIN"}
      </p>
      <div className="bg-black/40 border border-slate-600 p-4 rounded text-3xl font-mono text-white tracking-[0.5em] shadow-inner h-16 flex items-center justify-center">
        {"•".repeat(stage === "NEW_PIN" ? pin.length : confirmPin.length)}
      </div>
      {error && <p className="text-red-500 text-[10px] mt-3 font-bold uppercase animate-pulse">{error}</p>}
    </div>
  );

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
      <div className="bg-linear-to-b from-gray-300 to-gray-400 w-full max-w-5xl p-6 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          
          {/* SCREEN UNIT */}
          <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700 flex">
            <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
              {leftLabels.map((lbl, i) => <BezelButton key={i} side="left" onClick={leftActions[i]} disabled={!leftActions[i]} />)}
            </div>

            <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden flex items-center justify-center">
              {/* Bezel Labels overlay */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6 px-2 w-1/3 pointer-events-none z-20">
                {leftLabels.map((label, i) => label && (
                  <div key={i} className="h-10 flex items-center gap-1">
                    <span className="text-cyan-400 font-bold">&lt;</span>
                    <span className="bg-slate-800/90 text-white text-[10px] px-2 py-1 rounded border-l-2 border-cyan-500">{label}</span>
                  </div>
                ))}
              </div>
              <div className="absolute right-0 top-0 h-full flex flex-col justify-between py-6 px-2 w-1/3 pointer-events-none items-end z-20">
                {rightLabels.map((label, i) => label && (
                  <div key={i} className="h-10 flex items-center gap-1">
                    <span className="bg-slate-800/90 text-white text-[10px] px-2 py-1 rounded border-r-2 border-cyan-500">{label}</span>
                    <span className="text-cyan-400 font-bold">&gt;</span>
                  </div>
                ))}
              </div>
              {renderCenterScreen()}
            </div>

            <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
              {rightLabels.map((lbl, i) => <BezelButton key={i} side="right" onClick={rightActions[i]} disabled={!rightActions[i]} />)}
            </div>
          </div>

          {/* KEYPAD UNIT */}
          <div className="flex flex-col gap-6 w-72">
            <div className="bg-gray-300 p-4 rounded-xl border shadow-xl">
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3].map(n => <KeyButton key={n} label={n.toString()} onClick={() => pressNumber(n.toString())} />)}
                <KeyButton label="CANCEL" color="red" onClick={() => navigate("/atm")} />
                {[4,5,6].map(n => <KeyButton key={n} label={n.toString()} onClick={() => pressNumber(n.toString())} />)}
                <KeyButton label="CLEAR" color="yellow" onClick={clear} />
                {[7,8,9].map(n => <KeyButton key={n} label={n.toString()} onClick={() => pressNumber(n.toString())} />)}
                <KeyButton label="ENTER" color="green" onClick={handleEnter} />
                <div /><KeyButton label="0" onClick={() => pressNumber("0")} /><div /><div />
              </div>
            </div>
            <div className="bg-gray-200 p-3 rounded-lg border border-gray-400 shadow-inner flex flex-col items-center justify-center h-24">
                <div className="w-3/4 h-1.5 bg-gray-900 rounded-full mb-2 shadow-inner" />
                <span className="text-[10px] text-gray-500 font-black uppercase">Card Slot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}