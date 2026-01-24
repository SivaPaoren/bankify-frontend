export default function ATMHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quick Actions</h1>
        <p className="text-zinc-400">
          Tap a button to start a fast deposit, withdrawal, or transfer.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {["Deposit", "Withdraw", "Transfer"].map((label) => (
          <button
            key={label}
            className="h-32 rounded-2xl bg-lime-400 text-black text-xl font-bold hover:bg-lime-300 transition"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
