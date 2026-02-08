import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/BankifyLogo.png";

export default function ATMLogin() {
  const navigate = useNavigate();
  const { atmLogin, loading } = useAuth();
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!accountNumber) {
      setError("Please enter account number to continue");
      return;
    }

    if (!pin) {
      setError("Please enter PIN to continue");
      return;
    }

    setError("");

    // Call ATM Login
    const result = await atmLogin(accountNumber, pin);

    if (result.success) {
      navigate("/atm");
    } else {
      setError(result.message || "Invalid credentials");
    }
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
      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="w-[420px] space-y-4">
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

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-8 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-40 py-3 rounded-xl bg-emerald-500 text-black text-lg font-medium hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="w-40 py-3 rounded-xl bg-orange-400 text-black text-lg font-medium hover:bg-orange-300"
          >
            Clear
          </button>
        </div>
      </form>

    </div>
  );
}
