import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import bankifyLogo from "../../assets/BankifyWhiteLogo.png";

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
    <div
      className={`col-span-${span} relative active:top-0.5 transition-all`}
      onClick={onClick}
    >
      <div
        className={`
          h-12 rounded-md border-b-4 border-r-2 ${borderColor}
          bg-linear-to-br ${bgGradient} ${hoverColor} shadow-sm
          flex items-center justify-center ${fontSize} ${textColor}
          cursor-pointer select-none
        `}
      >
        {label}
      </div>
    </div>
  );
};

/* ---------- LOGIC COMPONENT ---------- */

export default function ATMLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { atmLogin, loading } = useAuth();

  const isExpired = new URLSearchParams(location.search).get('expired') === '1';
  // Pre-fill account number from sessionStorage if returning from expired session
  const savedAccount = sessionStorage.getItem('bankify_atm_last_account') || '';

  const [stage, setStage] = useState(isExpired && savedAccount ? "PIN" : "IDLE");
  const [accountNumber, setAccountNumber] = useState(savedAccount);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(isExpired ? "Session expired — please re-enter your PIN" : "");
  const [cardInserted, setCardInserted] = useState(false);

  /* --- LOGIC --- */

  const pressNumber = (n) => {
    if (loading) return;
    setError("");

    if (stage === "ACCOUNT" && accountNumber.length < 12) {
      setAccountNumber((p) => p + n);
    }
    if (stage === "PIN" && pin.length < 6) {
      setPin((p) => p + n);
    }
  };

  const backspace = () => {
    if (stage === "ACCOUNT") setAccountNumber((p) => p.slice(0, -1));
    if (stage === "PIN") setPin((p) => p.slice(0, -1));
    setError("");
  };

  const clear = () => {
    if (stage === "ACCOUNT") setAccountNumber("");
    if (stage === "PIN") setPin("");
    setError("");
  };

  // ── Keyboard support ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key >= '0' && e.key <= '9') pressNumber(e.key);
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Escape') cancel();
      else if (e.key === 'Enter') handleEnter();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, accountNumber, pin]);

  // Full cancel — reset all state. In expired mode, preserve savedAccount so re-login works.
  const cancel = () => {
    setAccountNumber(isExpired ? savedAccount : ""); // ✅ keep saved account, only clear if normal session
    setPin("");
    setError("");
    setStage("IDLE");
    setCardInserted(false);
  };

  // Hard exit — clears saved account, returns to fresh ATM login
  const exitSession = () => {
    sessionStorage.removeItem('bankify_atm_last_account');
    window.location.href = '/atm-login'; // full reload, clears isExpired flag
  };

  const handleEnter = async () => {
    if (stage === "ACCOUNT") {
      if (accountNumber.length !== 12) {
        setError("Invalid Account Number");
        return;
      }
      setStage("PIN");
      return;
    }

    if (stage === "PIN") {
      if (pin.length !== 6) {
        setError("Invalid PIN");
        return;
      }
      setStage("PROCESSING");
      const result = await atmLogin(accountNumber || "CARD", pin);
      if (result.success) {
        // Save account number for smooth re-login if session expires
        sessionStorage.setItem('bankify_atm_last_account', accountNumber);
        if (result.pinChangeRequired) {
          navigate("/atm/change-pin", { state: { knownCurrentPin: pin } });
        } else {
          navigate("/atm");
        }
      } else {
        setError("Invalid credentials");
        setPin("");
        setStage("PIN");
      }
    }
  };

  const handleInsertCard = () => {
    if (stage === "IDLE") {
      setAccountNumber("CARD");
      setStage("PIN");
    }
  };

  /* --- SCREEN CONFIG --- */

  let leftLabels = ["", "", "", ""];
  let rightLabels = ["", "", "", ""];
  let leftActions = [null, null, null, null];
  let rightActions = [null, null, null, null];

  if (stage === "IDLE") {
    if (isExpired && savedAccount) {
      leftLabels = ["", "", "", "Exit"];
      leftActions = [null, null, null, exitSession];
      rightLabels = ["", "", "", "Re-enter PIN"];
      rightActions = [null, null, null, () => { setAccountNumber(savedAccount); setStage("PIN"); setPin(""); setError(""); }];
    } else {
      rightLabels = ["", "", "", "Input Account No."];
      rightActions = [null, null, null, () => setStage("ACCOUNT")];
    }
  } else if (stage === "ACCOUNT" || stage === "PIN") {
    leftLabels = ["", "", "", "Cancel"];
    leftActions = [null, null, null, cancel];
    rightLabels = ["", "", "", "Enter"];
    rightActions = [null, null, null, handleEnter];
  }

  const renderCenterScreen = () => {
    if (stage === "IDLE") {
      return (
        <div className="text-center">
          {isExpired && (
            <div className="mb-3 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              ⚠ Session Expired
            </div>
          )}
          <h2 className="text-white text-xl font-bold tracking-wider mb-2">WELCOME</h2>
          <p className="text-cyan-400 text-xs font-mono animate-pulse uppercase">
            {isExpired && savedAccount
              ? `RE-AUTHENTICATE: ...${savedAccount.slice(-4)}`
              : "PLEASE INSERT CARD OR SELECT OPTION"}
          </p>
        </div>
      );
    }

    if (stage === "ACCOUNT") {
      // Format as 4-4-4 groups for readability
      const formatted = accountNumber
        ? accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
        : null;
      // Placeholder: 4 blocks of 3 underscores = 12 slots
      const placeholder = "_ _ _ _   _ _ _ _   _ _ _ _";
      return (
        <div className="text-center w-full max-w-xs">
          <p className="text-cyan-500 text-xs font-bold uppercase mb-4">Enter Account Number</p>
          <div className="bg-black/40 border border-slate-600 p-4 rounded text-xl font-mono text-white tracking-widest shadow-inner min-h-[60px] flex items-center justify-center">
            {formatted || <span className="text-slate-600 text-sm tracking-[0.2em]">{placeholder}</span>}
          </div>
          <p className="text-slate-500 text-[10px] font-mono mt-2">{accountNumber.length} / 12 digits</p>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
      );
    }

    if (stage === "PIN") {
      return (
        <div className="text-center w-full max-w-xs">
          <p className="text-cyan-500 text-xs font-bold uppercase mb-4">Enter PIN Code</p>
          <div className="bg-black/40 border border-slate-600 p-4 rounded text-3xl font-mono text-white tracking-[0.5em] shadow-inner h-16 flex items-center justify-center">
            {"•".repeat(pin.length)}
          </div>
          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
        </div>
      );
    }

    if (stage === "PROCESSING") {
      return (
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-mono text-sm">VERIFYING CREDENTIALS...</p>
        </div>
      );
    }
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
      <div className="bg-linear-to-b from-gray-300 to-gray-400 w-full max-w-5xl p-6 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

          {/* LEFT UNIT: SCREEN + CASH DISPENSER */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700">
              <div className="flex">
                <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
                  {leftLabels.map((lbl, i) => (
                    <BezelButton key={i} side="left" onClick={leftActions[i]} disabled={!leftActions[i]} />
                  ))}
                </div>

                <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6 px-2 w-1/3 pointer-events-none z-20">
                    {leftLabels.map((label, i) => (
                      <div key={i} className="h-10 flex items-center justify-start">
                        {label && (
                          <div className="flex items-center gap-1">
                            <span className="text-cyan-400 font-bold">&lt;</span>
                            <span className="bg-slate-800/90 text-white text-xs px-2 py-1 rounded border-l-2 border-cyan-500 shadow-lg">
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
                            <span className="bg-slate-800/90 text-white text-xs px-2 py-1 rounded border-r-2 border-cyan-500 shadow-lg text-right">
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

                <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
                  {rightLabels.map((lbl, i) => (
                    <BezelButton key={i} side="right" onClick={rightActions[i]} disabled={!rightActions[i]} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-200 p-6 rounded-xl border border-gray-400 shadow-inner flex flex-col items-center">
              <div className="w-full max-w-[400px] h-14 bg-linear-to-b from-gray-900 to-gray-800 rounded-md border-b-2 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-2xl">
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
                <div className={`w-16 h-1 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)] ${cardInserted ? 'bg-green-500' : 'bg-cyan-500'}`} />
              </div>

              <div
                onClick={() => {
                  if (cardInserted || stage !== "IDLE") return;
                  setCardInserted(true);
                  setTimeout(() => {
                    handleInsertCard();
                  }, 600);
                }}
                className={`
                  absolute left-1/2 -translate-x-1/2 z-20
                  w-28 h-[70px] rounded-lg shadow-xl cursor-pointer
                  bg-linear-to-br from-slate-800 via-slate-700 to-slate-900
                  border border-white/10 ring-1 ring-black/20
                  transition-all duration-700 ease-in-out
                  ${cardInserted ? "top-[18px] translate-y-8 opacity-0 scale-95" : "-top-10 hover:-translate-y-2"}
                `}
              >
                <div className="absolute top-3 left-3 w-5 h-4 bg-linear-to-br from-yellow-200 to-yellow-600 rounded-sm" />
                <div className="absolute bottom-2 right-3 text-[8px] font-bold text-cyan-400 italic">BANKIFY</div>
              </div>

              <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 text-center">
                {cardInserted ? "Card Reading..." : "Insert Card"}
              </div>
            </div>

            <div className="bg-gray-300 p-4 rounded-xl border shadow-xl">
              <div className="grid grid-cols-4 gap-2">
                <KeyButton label="1" onClick={() => pressNumber("1")} />
                <KeyButton label="2" onClick={() => pressNumber("2")} />
                <KeyButton label="3" onClick={() => pressNumber("3")} />
                <KeyButton label="CANCEL" color="red" onClick={cancel} />
                <KeyButton label="4" onClick={() => pressNumber("4")} />
                <KeyButton label="5" onClick={() => pressNumber("5")} />
                <KeyButton label="6" onClick={() => pressNumber("6")} />
                <KeyButton label="CLEAR" color="yellow" onClick={clear} />
                <KeyButton label="7" onClick={() => pressNumber("7")} />
                <KeyButton label="8" onClick={() => pressNumber("8")} />
                <KeyButton label="9" onClick={() => pressNumber("9")} />
                <KeyButton label="ENTER" color="green" onClick={handleEnter} />
                <div /><KeyButton label="0" onClick={() => pressNumber("0")} /><div /><div />
              </div>
            </div>

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