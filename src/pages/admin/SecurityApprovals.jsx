import React, { useState, useEffect } from 'react';
import { adminService } from '../../api';
import {
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Key,
    Server
} from 'lucide-react';

export default function SecurityApprovals() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await adminService.listRotationRequests();
            // Assuming data is an array of requests. Filter for pending if needed.
            setRequests(Array.isArray(data) ? data : []);
            setError('');
        } catch (e) {
            console.error("Failed to fetch rotation requests", e);
            setError("Failed to load security approval requests. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (partnerId, requestId) => {
        try {
            setProcessingId(requestId || partnerId);
            await adminService.approveKeyRotation(requestId);
            // Re-fetch or filter out
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (e) {
            console.error("Failed to approve rotation", e);
            setError("Failed to approve the key rotation request.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (partnerId, requestId) => {
        try {
            setProcessingId(requestId || partnerId);
            await adminService.rejectKeyRotation(requestId);
            // Re-fetch or filter out
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (e) {
            console.error("Failed to reject rotation", e);
            setError("Failed to reject the key rotation request.");
        } finally {
            setProcessingId(null);
        }
    };

    // Derived stats
    const pendingCount = requests.length;

    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        {/* <Shield className="text-cyan-400" size={32} /> */}
                        Security Approvals
                    </h1>
                    <p className="text-primary-300 mt-1">Review and manage pending security requests, including API key rotations.</p>
                </div>
                <div className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {pendingCount} Pending Requests
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-300">Action Failed</h4>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* ── Requests Table ── */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-widest text-primary-200 font-bold">
                            <th className="px-6 py-4">App ID</th>
                            <th className="px-6 py-4">Request Reason</th>
                            <th className="px-6 py-4">Requested At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-16">
                                    <div className="flex flex-col items-center gap-3 text-primary-400/60">
                                        <div className="w-8 h-8 border-2 border-primary-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                        <span className="text-sm italic">Loading requests…</span>
                                    </div>
                                </td>
                            </tr>
                        ) : requests.length > 0 ? (
                            requests.map((req, idx) => {
                                const isProcessing = processingId === req.id;

                                return (
                                    <tr key={req.id || idx} className="hover:bg-white/5 transition-colors group">

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                                    <Key size={18} className="text-purple-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                        {req.partnerName || 'Unknown App'}
                                                    </span>
                                                    <span className="text-xs text-primary-400 font-mono">
                                                        ID: {req.partnerId ? String(req.partnerId).substring(0, 8).toUpperCase() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="text-sm text-primary-300 italic">
                                                {req.reason || 'No reason provided'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-primary-300 font-mono">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-primary-500 shrink-0" />
                                                <span>
                                                    {req.requestedAt
                                                        ? new Date(req.requestedAt).toLocaleString()
                                                        : 'Unknown Date'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleReject(req.partnerId, req.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/80 border border-red-500/30 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                                >
                                                    <XCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(req.partnerId, req.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                                >
                                                    <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                    {isProcessing ? 'Processing…' : 'Approve'}
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-20">
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-4 ring-emerald-500/5">
                                            <CheckCircle size={32} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white tracking-tight">All Caught Up!</h3>
                                            <p className="text-sm text-primary-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                                There are no pending security approval requests at this time. The system is secure.
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-center text-primary-500 font-medium">
                Approving a key rotation will immediately invalidate the partner's old API key and send them a new one.
            </p>
        </div>
    );
}
