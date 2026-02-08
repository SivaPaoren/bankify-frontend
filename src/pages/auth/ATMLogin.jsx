import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/BankifyLogo.png";

export default function ATMLogin() {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!accountNumber) {
      setError("Please enter account number to continue");
      return;
    }

    if (!pin) {
      setError("Please enter PIN to continue");
      return;
    }

    setError("");
    navigate("/atm");
  };

  const handleClear = () => {
    setAccountNumber("");
    setPin("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-10">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Bankify ATM" className="h-14 w-14" />
        <h1 className="text-3xl font-semibold">Bankify ATM</h1>
      </div>

      {/* Inputs */}
      <div className="w-[420px] space-y-4">
        <input
          placeholder="Enter account number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="w-full p-4 rounded-xl bg-gray-200 text-lg focus:outline-none"
        />

        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-4 rounded-xl bg-gray-200 text-lg focus:outline-none"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-8">
        <button
          onClick={handleConfirm}
          className="w-40 py-3 rounded-xl bg-emerald-500 text-black text-lg font-medium hover:bg-emerald-400"
        >
          Confirm
        </button>

        <button
          onClick={handleClear}
          className="w-40 py-3 rounded-xl bg-orange-400 text-black text-lg font-medium hover:bg-orange-300"
        >
          Clear
        </button>
      </div>

    </div>
  );
}
