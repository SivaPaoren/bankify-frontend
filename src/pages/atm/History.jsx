import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Repeat, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { transactionService } from "../../api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";

export default function ATMHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currency = user?.currency || "THB";
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("ALL"); // ALL, SUCCESS, PENDING, FAILED

    useEffect(() => {
        transactionService.getTransactions()
            .then(data => {
                const list = Array.isArray(data) ? data : (data.content || []);
                setTransactions(list);
            })
            .catch(err => console.error(err));
    }, []);

    // Helper to get styles based on type
    const getTypeStyles = (type) => {
        switch (type?.toLowerCase()) {
            case "deposit":
                return {
                    icon: <ArrowDownLeft size={16} />,
                    color: "text-emerald-600 bg-emerald-100",
                    label: "Incoming"
                };
            case "withdraw":
            case "withdrawal":
                return {
                    icon: <ArrowUpRight size={16} />,
                    color: "text-red-600 bg-red-100",
                    label: "Outgoing"
                };
            case "transfer":
                return {
                    icon: <Repeat size={16} />,
                    color: "text-blue-600 bg-blue-100",
                    label: "Transfer"
                };
            default:
                return { icon: null, color: "text-slate-600 bg-slate-100" };
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === "ALL") return true;
        return t.status?.toUpperCase() === filter;
    });

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center relative font-sans text-slate-800">

            {/* Background Decorator */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent -z-10"></div>

            {/* Header Container */}
            <div className="w-full max-w-3xl px-6 py-8">

                {/* Nav Bar */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-medium">Back to ATM</span>
                    </button>

                    {/* User Profile Tiny Pill */}
                    <div className="hidden md:flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-white/50 shadow-sm backdrop-blur-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">U</div>
                        <span className="text-xs font-semibold text-slate-600">{user?.name}</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">

                    {/* Card Header */}
                    <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
                            <p className="text-slate-500 text-sm mt-1">Review your recent ATM activity.</p>
                        </div>

                        {/* Search/Filter Actions */}
                        <div className="flex gap-2">
                            <div className="relative">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="FAILED">Failed</option>
                                </select>
                                <Filter size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                                    <th className="px-6 py-4">Transaction</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransactions.length > 0 ? filteredTransactions.map((t) => {
                                    const style = getTypeStyles(t.type);
                                    const isPositive = t.amount > 0 || t.type === 'DEPOSIT'; // Simple check

                                    return (
                                        <tr key={t.id} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Icon Badge */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.color}`}>
                                                        {style.icon}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 capitalize">{t.type.toLowerCase()}</div>
                                                        <div className="text-xs text-slate-400">ID: {t.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-10 ')}`}>
                                                    {t.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                                {new Date(t.createdAt || t.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold text-base ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {isPositive ? '+' : ''}{t.amount.toLocaleString()} {t.currency || currency}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colspan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                            No transactions found matching your filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination / Footer */}
                    <div className="p-6 border-t border-slate-100 text-center">
                        <button className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
                            Load More Transactions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}