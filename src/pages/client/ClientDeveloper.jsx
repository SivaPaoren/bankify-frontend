import React, { useState, useEffect } from 'react';
import { partnerService } from '../../api';
import { Key, RefreshCw, Clock, ShieldAlert, Copy, CheckCircle } from 'lucide-react';

export default function ClientDeveloper() {
  const [rotationHistory, setRotationHistory] = useState([]);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [info, history] = await Promise.all([
        partnerService.getPartnerInfo(),
        partnerService.getRotationHistory()
      ]);
      setPartnerInfo(info);
      setRotationHistory(history);
    } catch (err) {
      console.error("Failed to load developer data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRotation = async () => {
    try {
      await partnerService.requestRotation(reason);
      setShowRotateModal(false);
      fetchData(); // Refresh history
    } catch (err) {
      alert("Failed to submit request: " + err.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Developer Settings</h1>

      {/* API Details Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
              <Key size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">API Credentials</h2>
              <p className="text-sm text-slate-400">Use these to authenticate server-to-server requests.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowRotateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all"
          >
            <RefreshCw size={16} />
            Request Rotation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">App ID</label>
            <p className="font-mono text-sm text-white mt-1">{partnerInfo?.id || 'Loading...'}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">API Key</label>
            <p className="font-mono text-sm text-slate-400 mt-1">••••••••••••••••••••••••</p>
            <p className="text-[10px] text-orange-400/60 mt-2 italic">Hidden for security. Request rotation if lost.</p>
          </div>
        </div>
      </div>

      {/* Request History Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Rotation Requests
          </h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-black/20 text-[10px] uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rotationHistory.map((req) => (
              <tr key={req.id} className="text-sm text-slate-300">
                <td className="px-6 py-4 font-mono text-xs">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{req.reason || 'No reason provided'}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                    req.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    req.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rotation Modal */}
      {showRotateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Request New API Key</h3>
            <p className="text-sm text-slate-400 mb-6">
              This will notify the bank administrator. Once approved, your current key will be deactivated.
            </p>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-orange-500 outline-none h-32 mb-4"
              placeholder="Reason for rotation (e.g., Key leaked, Periodic security update)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRotateModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
              <button onClick={handleRequestRotation} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}