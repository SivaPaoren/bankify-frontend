export default function FinancialActions({ title, subtitle }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-slate-600">
        {subtitle ||
          "Here you will add forms for Deposit, Withdraw, and Transfer, and show a transaction history."}
      </p>
    </div>
  );
}
