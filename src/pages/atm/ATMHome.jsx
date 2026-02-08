import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bankifyLogo from "../../assets/BankifyLogo.png";

/* ---------- UI PARTS (UNCHANGED VISUALLY) ---------- */

const BezelButton = () => (
  <div className="w-10 h-12 bg-gray-300 rounded border border-gray-500 shadow-inner" />
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

  const [balance] = useState(135798.422);
  const [transactions] = useState([
    { type: "Deposit", amount: 2345 },
    { type: "Deposit", amount: 123453 },
    { type: "Withdraw", amount: -110975307660901 },
  ]);

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
      <div className="flex gap-8 items-start max-w-6xl w-full">
        {/* LEFT – MAIN SCREEN */}
        <div className="bg-gray-300 p-6 rounded-2xl border border-gray-400 shadow-xl flex-grow">
          <div className="flex gap-4">
            {/* LEFT BUTTONS */}
            <div className="flex flex-col gap-6 py-12">
              <BezelButton />
              <BezelButton />
              <BezelButton />
              <BezelButton />
            </div>

            {/* SCREEN */}
            <div className="flex-grow bg-white rounded-lg shadow-inner p-8 flex flex-col">
              {/* BALANCE */}
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  Total Balance
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {balance.toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-gray-500">THB</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => navigate("/atm/deposit")}
                  className="bg-blue-600 text-white py-4 rounded-xl font-semibold shadow"
                >
                  Deposit
                </button>
                <button
                  onClick={() => navigate("/atm/withdraw")}
                  className="bg-blue-600 text-white py-4 rounded-xl font-semibold shadow"
                >
                  Withdraw
                </button>
              </div>

              <button
                onClick={() => navigate("/atm/transfer")}
                className="border-2 border-gray-300 py-4 rounded-xl font-semibold mb-8"
              >
                Transfer
              </button>

              {/* RECENT ACTIVITY */}
              <div className="bg-gray-50 rounded-xl p-4 mt-auto">
                <div className="flex justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Recent Activity
                  </p>
                  <button
                    onClick={() => navigate("/atm/history")}
                    className="text-xs text-blue-600 font-bold"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  {transactions.map((t, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600">{t.type}</span>
                      <span
                        className={
                          t.amount > 0
                            ? "text-green-600 font-bold"
                            : "text-gray-900 font-bold"
                        }
                      >
                        {t.amount > 0 ? "+" : ""}
                        {Math.abs(t.amount).toLocaleString()} THB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex flex-col gap-6 py-12">
              <BezelButton />
              <BezelButton />
              <BezelButton />
              <BezelButton />
            </div>
          </div>
        </div>

        {/* RIGHT – HARDWARE */}
        <div className="flex flex-col gap-6 w-80">
          {/* TOP SCREEN */}
          <div className="bg-gray-300 p-6 rounded-2xl border border-gray-400 shadow-xl">
            <div className="bg-black h-24 rounded mb-4" />
            <div className="bg-black h-32 rounded" />
          </div>

          {/* KEYPAD */}
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
