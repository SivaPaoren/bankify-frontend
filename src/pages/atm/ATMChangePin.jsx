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
    if (color === "yellow") { bgGradient = "from-yellow-400 to-yellow-600"; borderColor = "border-yellow-800"; textColor = "text-black"; }
    if (color === "green") { bgGradient = "from-green-600 to-green-800"; borderColor = "border-green-900"; textColor = "text-white"; }

    return (
        <div className="relative active:translate-y-0.5 transition-all" onClick={onClick}>
            <div className={`h-12 w-full rounded-md border-b-4 border-r-2 ${borderColor} bg-linear-to-br ${bgGradient} shadow-md flex items-center justify-center font-extrabold cursor-pointer select-none ${textColor} ${label.length > 1 ? "text-[10px] tracking-tighter" : "text-xl"}`}>
                {label}
            </div>
        </div>
    );
};

/* ---------- STAGES ----------
  CURRENT_PIN  →  NEW_PIN  →  CONFIRM_PIN  →  PROCESSING  →  SUCCESS / ERROR
*/

export default function ATMChangePin() {
    const navigate = useNavigate();

    const [stage, setStage] = useState("CURRENT_PIN");
    const [currentPin, setCurrentPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");

    // Current active buffer based on stage
    const activePin = stage === "CURRENT_PIN" ? currentPin : stage === "NEW_PIN" ? newPin : confirmPin;
    const setActivePin = stage === "CURRENT_PIN" ? setCurrentPin : stage === "NEW_PIN" ? setNewPin : setConfirmPin;

    const pressNumber = (n) => {
        setError("");
        if (activePin.length < 6) setActivePin((p) => p + n);
    };

    const backspace = () => {
        setError("");
        setActivePin((p) => p.slice(0, -1));
    };

    const clear = () => {
        setError("");
        setActivePin("");
    };

    const cancel = () => navigate("/atm");

    const handleEnter = async () => {
        if (stage === "CURRENT_PIN") {
            if (currentPin.length !== 6) { setError("PIN MUST BE 6 DIGITS"); return; }
            setStage("NEW_PIN");
            return;
        }
        if (stage === "NEW_PIN") {
            if (newPin.length !== 6) { setError("PIN MUST BE 6 DIGITS"); return; }
            setStage("CONFIRM_PIN");
            return;
        }
        if (stage === "CONFIRM_PIN") {
            if (confirmPin.length !== 6) { setError("PIN MUST BE 6 DIGITS"); return; }
            if (newPin !== confirmPin) {
                setError("PINs DO NOT MATCH");
                setConfirmPin("");
                return;
            }
            setStage("PROCESSING");
            try {
                // Backend AtmChangePinRequest record uses `oldPin`, NOT `currentPin`
                await atmService.changePin({ oldPin: currentPin, newPin });
                setStage("SUCCESS");
            } catch (err) {
                const msg = err.response?.data?.message || "CHANGE PIN FAILED";
                setError(msg.toUpperCase());
                setCurrentPin("");
                setNewPin("");
                setConfirmPin("");
                setStage("CURRENT_PIN");
            }
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKey = (e) => {
            if (["SUCCESS", "PROCESSING"].includes(stage)) return;
            if (e.key >= "0" && e.key <= "9") pressNumber(e.key);
            else if (e.key === "Backspace") backspace();
            else if (e.key === "Escape") cancel();
            else if (e.key === "Enter") handleEnter();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stage, currentPin, newPin, confirmPin]);

    // Screen label maps
    const stageLabel = {
        CURRENT_PIN: "ENTER CURRENT PIN",
        NEW_PIN: "ENTER NEW PIN",
        CONFIRM_PIN: "CONFIRM NEW PIN",
        PROCESSING: "PROCESSING...",
        SUCCESS: "PIN CHANGED",
    };

    const renderScreen = () => {
        if (stage === "PROCESSING") {
            return (
                <div className="text-center space-y-4 text-white text-xs">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="animate-pulse tracking-widest uppercase">Updating PIN...</p>
                </div>
            );
        }

        if (stage === "SUCCESS") {
            return (
                <div className="text-center space-y-3 text-white font-mono">
                    <div className="text-4xl mb-2">✓</div>
                    <p className="text-green-400 font-bold uppercase tracking-widest text-sm">PIN Changed!</p>
                    <p className="text-cyan-400/60 text-[10px]">Press CANCEL to return.</p>
                </div>
            );
        }

        return (
            <div className="text-center w-full max-w-xs font-mono">
                <p className="text-cyan-500 text-[10px] font-bold uppercase mb-3 tracking-widest">
                    {stageLabel[stage]}
                </p>
                {/* Step indicator */}
                <div className="flex justify-center gap-2 mb-4">
                    {["CURRENT_PIN", "NEW_PIN", "CONFIRM_PIN"].map((s) => (
                        <div
                            key={s}
                            className={`w-2 h-2 rounded-full transition-all ${s === stage ? "bg-cyan-400 scale-125" : "bg-slate-600"
                                }`}
                        />
                    ))}
                </div>
                {/* PIN dots */}
                <div className="bg-black/40 border border-slate-600 p-4 rounded shadow-inner flex justify-center gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all ${i < activePin.length
                                ? "bg-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                : "bg-transparent border-slate-500"
                                }`}
                        />
                    ))}
                </div>
                {error && <p className="text-red-400 text-[10px] mt-2 font-bold uppercase">{error}</p>}
            </div>
        );
    };

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
            <div className="bg-linear-to-b from-gray-300 to-gray-400 w-full max-w-5xl p-6 rounded-b-2xl shadow-2xl border-x-8 border-b-8 border-gray-500">
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

                    {/* LEFT UNIT: SCREEN */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-gray-800 p-4 rounded-xl shadow-inner border-4 border-gray-700">
                            <div className="flex">
                                {/* Left bezel buttons */}
                                <div className="grid grid-rows-4 py-1 h-[340px] pr-2">
                                    <BezelButton side="left" disabled />
                                    <BezelButton side="left" disabled />
                                    <BezelButton side="left" disabled />
                                    <BezelButton side="left" onClick={stage === "SUCCESS" ? cancel : () => { if (stage === "NEW_PIN") setStage("CURRENT_PIN"); else if (stage === "CONFIRM_PIN") setStage("NEW_PIN"); else cancel(); }} />
                                </div>

                                {/* SCREEN */}
                                <div className="w-[480px] h-[340px] bg-slate-900 rounded border-4 border-black relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
                                    {/* Screen labels */}
                                    <div className="absolute left-0 bottom-6 px-2 z-20">
                                        <div className="h-10 flex items-center gap-1">
                                            <span className="text-cyan-400 font-bold">&lt;</span>
                                            <span className="bg-slate-800/90 text-white text-[10px] px-2 py-1.5 rounded border-l-2 border-cyan-500 min-w-[60px] text-center uppercase">
                                                {stage === "SUCCESS" ? "Exit" : stage === "CURRENT_PIN" ? "Cancel" : "Back"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute right-0 bottom-6 px-2 z-20">
                                        {stage !== "SUCCESS" && stage !== "PROCESSING" && (
                                            <div className="h-10 flex items-center gap-1">
                                                <span className="bg-slate-800/90 text-white text-[10px] px-2 py-1.5 rounded border-r-2 border-cyan-500 min-w-[60px] text-center uppercase">
                                                    {stage === "CONFIRM_PIN" ? "Confirm" : "Next"}
                                                </span>
                                                <span className="text-cyan-400 font-bold">&gt;</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Center content */}
                                    <div className="w-full h-full flex items-center justify-center p-5 z-10">
                                        {renderScreen()}
                                    </div>
                                </div>

                                {/* Right bezel buttons */}
                                <div className="grid grid-rows-4 py-1 h-[340px] pl-2">
                                    <BezelButton side="right" disabled />
                                    <BezelButton side="right" disabled />
                                    <BezelButton side="right" disabled />
                                    <BezelButton side="right" onClick={stage === "SUCCESS" ? cancel : handleEnter} />
                                </div>
                            </div>
                        </div>

                        {/* Cash dispenser (decoration) */}
                        <div className="bg-gray-200 p-6 rounded-xl border border-gray-400 shadow-inner flex flex-col items-center">
                            <div className="w-full max-w-[400px] h-14 bg-linear-to-b from-gray-900 to-gray-800 rounded-md border-b-2 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-2xl">
                                <div className="w-[85%] h-3 bg-black rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
                            </div>
                            <div className="text-[12px] text-gray-500 font-extrabold uppercase mt-3 tracking-widest">Cash Dispenser</div>
                        </div>
                    </div>

                    {/* RIGHT UNIT: CARD + KEYPAD + RECEIPT */}
                    <div className="flex flex-col gap-6 w-72">
                        <div className="bg-gray-200 p-4 rounded-xl border border-gray-400 shadow-inner">
                            <div className="h-10 bg-gray-900 rounded relative flex items-center justify-center border-b border-gray-700">
                                <div className="w-16 h-1 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 text-center">Card Inserted</div>
                        </div>

                        <div className="bg-gray-300 p-4 rounded-xl border-2 border-gray-400 shadow-xl">
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
                                <div className="invisible" />
                                <KeyButton label="0" onClick={() => pressNumber("0")} />
                                <div className="invisible" />
                                <div className="invisible" />
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
