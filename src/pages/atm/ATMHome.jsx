import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bankifyLogo from "../../assets/BankifyLogo.png";

/* ---------- HARDWARE UI ---------- */

const BezelButton = ({ onClick, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`w-10 h-12 rounded border border-gray-500 shadow-inner
      ${disabled ? "bg-gray-200" : "bg-gray-300 active:translate-y-0.5"}`}
  />
);

const KeyButton = ({ label, color }) => {
  let base = "bg-gray-300 text-black border-gray-500";
  if (color === "red") base = "bg-red-500 text-white border-red-700";
  if (color === "yellow") base = "bg-yellow-400 text-black border-yellow-600";
  if (color === "green") base = "bg-green-500 text-white border-green-700";

  return (
    <div
      className={`${base} h-12 rounded border-b-4 flex items-center justify-center font-bold text-sm`}
    >
      {label}
    </div>
  );
};

export default function ATMHome() {
  const navigate = useNavigate();

  /* ---------- DISPLAY DATA ---------- */
  const [balance] = useState(135798.422);

  /* ---------- ATM BUTTON MAPPING ---------- */
  /*
    LEFT (top → bottom)
    1. Balance
    2. Transfer
    3. —
    4. Exit

    RIGHT (top → bottom)
    1. Deposit
    2. Withdraw
    3. —
    4. —
  */

  const leftButtons = [
    () => {},                        // Balance (current screen)
    () => navigate("/atm/transfer"), // Transfer
    null,
    () => navigate("/atm-login"),    // Exit
  ];

  const rightButtons = [
    () => navigate("/atm/deposit"),  // Deposit
    () => navigate("/atm/withdraw"), // Withdraw
    null,
    null,
  ];

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
              style={{ height: 420 }}
            >
              {leftButtons.map((fn, i) => (
                <BezelButton
                  key={i}
                  onClick={fn}
                  disabled={!fn}
                />
              ))}
            </div>

            {/* FIXED SCREEN */}
            <div
              className="bg-white rounded-lg shadow-inner p-8 flex flex-col"
              style={{ width: 520, height: 420 }}
            >
              <div className="flex justify-between h-full">

                {/* LEFT LABELS */}
                <div className="flex flex-col justify-between text-left text-lg font-medium">
                  <div>Balance</div>
                  <div>Transfer</div>
                  <div>&nbsp;</div>
                  <div>Exit</div>
                </div>

                {/* CENTER CONTENT */}
                <div className="flex flex-col items-center justify-center text-center flex-grow">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Total Balance
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {balance.toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold text-gray-500 mt-1">
                    THB
                  </p>
                </div>

                {/* RIGHT LABELS */}
                <div className="flex flex-col justify-between text-right text-lg font-medium">
                  <div>Deposit</div>
                  <div>Withdraw</div>
                  <div>&nbsp;</div>
                  <div>&nbsp;</div>
                </div>
              </div>
            </div>

            {/* RIGHT BEZEL BUTTONS */}
            <div
              className="flex flex-col justify-between"
              style={{ height: 420 }}
            >
              {rightButtons.map((fn, i) => (
                <BezelButton
                  key={i}
                  onClick={fn}
                  disabled={!fn}
                />
              ))}
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
              <KeyButton label="1" />
              <KeyButton label="2" />
              <KeyButton label="3" />
              <KeyButton label="CANCEL" color="red" />

              <KeyButton label="4" />
              <KeyButton label="5" />
              <KeyButton label="6" />
              <KeyButton label="CLEAR" color="yellow" />

              <KeyButton label="7" />
              <KeyButton label="8" />
              <KeyButton label="9" />
              <KeyButton label="ENTER" color="green" />

              <div />
              <KeyButton label="0" />
              <div />
              <div />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
