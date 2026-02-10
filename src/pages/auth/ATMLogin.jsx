import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import bankifyLogo from "../../assets/BankifyLogo.png";

/* ---------- HARDWARE CONSTANTS (MUST MATCH ATMHome) ---------- */
const ATM_SCREEN_WIDTH = 520;
const ATM_SCREEN_HEIGHT = 420;

/* ---------- UI PARTS ---------- */

const BezelButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-10 h-12 bg-gray-300 rounded border border-gray-500 shadow-inner active:translate-y-0.5"
  />
);

const KeyButton = ({ label, color, onClick }) => {
  let base = "bg-gray-300 text-black border-gray-500";
  if (color === "red") base = "bg-red-500 text-white border-red-700";
  if (color === "yellow") base = "bg-yellow-400 text-black border-yellow-600";
  if (color === "green") base = "bg-green-500 text-white border-green-700";

  return (
    <button
      onClick={onClick}
      className={`${base} h-12 rounded border-b-4 flex items-center justify-center font-bold text-sm active:translate-y-0.5`}
    >
      {label}
    </button>
  );
};

export default function ATMLogin() {
  const navigate = useNavigate();
  const { atmLogin, loading } = useAuth();

  // STATES: IDLE | ACCOUNT | PIN | PROCESSING
  const [stage, setStage] = useState("IDLE");
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  /* ---------- KEYPAD LOGIC ---------- */

  const pressNumber = (n) => {
    if (loading) return;
    setError("");

    if (stage === "ACCOUNT" && accountNumber.length < 12) {
      setAccountNumber((p) => p + n);
    }

    if (stage === "PIN" && pin.length < 4) {
      setPin((p) => p + n);
    }
  };

  const clear = () => {
    if (stage === "ACCOUNT") setAccountNumber("");
    if (stage === "PIN") setPin("");
    setError("");
  };

  const cancel = () => {
    setAccountNumber("");
    setPin("");
    setError("");
    setStage("IDLE");
  };

  const enter = async () => {
    if (stage === "ACCOUNT") {
      if (accountNumber.length < 6) {
        setError("Invalid account number");
        return;
      }
      setStage("PIN");
      return;
    }

    if (stage === "PIN") {
      if (pin.length !== 4) {
        setError("PIN must be 4 digits");
        return;
      }

      setStage("PROCESSING");

      const result = await atmLogin(accountNumber || "CARD", pin);

      if (result.success) {
        navigate("/atm");
      } else {
        setError("Invalid credentials");
        setPin("");
        setStage("PIN");
      }
    }
  };

  /* ---------- SCREEN CONTENT ---------- */

  const ScreenContent = () => {
    if (stage === "IDLE") {
      return (
        <div className="text-center">
          <p className="text-lg font-semibold mb-6">Welcome</p>

          <div className="space-y-4">
            <div
              onClick={() => {
                setAccountNumber("CARD");
                setStage("PIN");
              }}
              className="cursor-pointer bg-blue-600 text-white py-4 rounded-xl font-semibold"
            >
              Insert Card →
            </div>

            <div
              onClick={() => setStage("ACCOUNT")}
              className="cursor-pointer border-2 border-gray-300 py-4 rounded-xl font-semibold"
            >
              Enter Account Number →
            </div>
          </div>
        </div>
      );
    }

    if (stage === "ACCOUNT") {
      return (
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
            Enter Account Number
          </p>
          <p className="text-2xl font-mono mb-4">
            {accountNumber || "______"}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    if (stage === "PIN") {
      return (
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
            Enter PIN
          </p>
          <p className="text-3xl font-mono tracking-widest mb-4">
            {"•".repeat(pin.length).padEnd(4, "○")}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-lg font-semibold">Processing…</p>
        <p className="text-sm text-gray-500 mt-2">Please wait</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <img src={bankifyLogo} alt="Bankify" className="w-12 h-12" />
        <h1 className="text-4xl font-normal">
          Bankify <span className="font-light">ATM</span>
        </h1>
      </div>

      {/* MACHINE BODY */}
      <div className="flex gap-8 items-start">

        {/* LEFT – MAIN MACHINE */}
        <div className="bg-gray-300 p-6 rounded-2xl border border-gray-400 shadow-xl">

          <div className="flex gap-4">

            {/* LEFT BEZEL BUTTONS */}
            <div
              className="flex flex-col justify-between"
              style={{ height: ATM_SCREEN_HEIGHT }}
            >
              <BezelButton />
              <BezelButton />
              <BezelButton />
              <BezelButton onClick={cancel} />
            </div>

            {/* FIXED SCREEN */}
            <div
              className="bg-white rounded-lg shadow-inner p-8 flex flex-col justify-center"
              style={{
                width: ATM_SCREEN_WIDTH,
                height: ATM_SCREEN_HEIGHT,
              }}
            >
              <ScreenContent />
            </div>

            {/* RIGHT BEZEL BUTTONS */}
            <div
              className="flex flex-col justify-between"
              style={{ height: ATM_SCREEN_HEIGHT }}
            >
              <BezelButton />
              <BezelButton />
              <BezelButton />
              <BezelButton />
            </div>

          </div>
        </div>

        {/* RIGHT – HARDWARE */}
        <div className="flex flex-col gap-6 w-80">

          <div className="bg-gray-300 p-6 rounded-2xl border border-gray-400 shadow-xl">
            <div className="bg-black h-24 rounded mb-4" />
            <div className="bg-black h-32 rounded" />
          </div>

          <div className="bg-gray-300 p-6 rounded-2xl border border-gray-400 shadow-xl">
            <div className="grid grid-cols-4 gap-3">
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
              <KeyButton label="ENTER" color="green" onClick={enter} />

              <div />
              <KeyButton label="0" onClick={() => pressNumber("0")} />
              <div />
              <div />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
