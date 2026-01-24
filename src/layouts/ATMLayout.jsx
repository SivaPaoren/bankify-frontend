import { useNavigate } from "react-router-dom";

export default function ATMLayout() {
  const navigate = useNavigate();

  // Mock data for UI
  const date = "24 January 2026";
  const userName = "User Name";
  const accountNumber = "Account Number";
  const balance = "123,432.42";

  return (
    <div className="min-h-screen bg-white text-black px-16 py-10 relative">

      {/* Top row */}
      <div className="flex justify-between items-start">
        <span className="text-sm">{date}</span>

        <div className="text-right">
          <p className="text-xl font-semibold">
            Welcome, {userName}
          </p>
          <p className="text-sm">{accountNumber}</p>
        </div>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center mt-32 space-y-12">

        {/* Balance */}
        <div className="text-center">
          <p className="text-4xl font-semibold">Balance</p>
          <p className="text-2xl mt-2">{balance}</p>
        </div>

        {/* Deposit / Withdraw */}
        <div className="flex gap-16 mt-10">
          <button className="w-64 h-20 rounded-xl bg-gray-200 text-xl">
            Deposit
          </button>

          <button className="w-64 h-20 rounded-xl bg-gray-200 text-xl">
            Withdraw
          </button>
        </div>

        {/* Transfer */}
        <button className="w-64 h-20 rounded-xl bg-gray-200 text-xl">
          Transfer
        </button>

        {/* View history */}
        <button className="px-12 py-3 rounded-xl bg-gray-200 text-lg mt-4">
          View Transaction History
        </button>
      </div>

      {/* Exit */}
      <button
        onClick={() => navigate("/atm-login")}
        className="absolute bottom-8 left-16 text-sm"
      >
        Exit
      </button>
    </div>
  );
}
