export default function StatusBadge({ status }) {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const statusStyles = {
    // payment / transaction
    SUCCESS: "bg-green-100 text-green-800",
    SUCCEEDED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-yellow-100 text-yellow-800",
    REFUNDED: "bg-blue-100 text-blue-800",

    // account / customer
    ACTIVE: "bg-green-100 text-green-800",
    FROZEN: "bg-orange-100 text-orange-800",
    CLOSED: "bg-slate-100 text-slate-800",
    DISABLED: "bg-slate-100 text-slate-800",
  };

  const classes =
    statusStyles[status] ?? "bg-slate-100 text-slate-800";

  return (
    <span className={`${baseClasses} ${classes}`}>
      {status}
    </span>
  );
}
