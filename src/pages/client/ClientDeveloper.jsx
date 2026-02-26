import React, { useState, useEffect } from 'react';
import { partnerService } from '../../api';
import { Key, RefreshCw, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ClientDeveloper() {
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotateReason, setRotateReason] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [info, logs] = await Promise.all([
          partnerService.getPartnerInfo(),
          partnerService.getRotationHistory()
        ]);
        setPartnerInfo(info);
        setHistory(logs);
      } catch (err) {
        console.error("Error loading dev settings", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRotate = async () => {
    if (!rotateReason) return alert("Please provide a reason for rotation.");
    setIsRotating(true);
    try {
      await partnerService.requestRotation(rotateReason);
      setRotateReason('');
      alert("Rotation request submitted for Admin approval.");
      // Refresh history to show PENDING status
      const logs = await partnerService.getRotationHistory();
      setHistory(logs);
    } catch (err) {
      alert("Failed to request rotation.");
    } finally {
      setIsRotating(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading Developer Console...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white">Developer Console</h1>
        <p className="text-slate-400">Manage your API integration and security keys.</p>
      </header>

      {/* Section 1: API Details */}
      <section className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-400">
                  <Key size={24} />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-white">API Credentials</h2>
                  <p className="text-sm text-slate-400">Production environment identifiers.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* App ID Field */}
              <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Partner App ID</p>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-white text-sm">
                      {partnerInfo?.id || '---'}
                  </div>
              </div>

              {/* API Key Field (The part you asked about) */}
              <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">API Secret Key</p>
                  <div className="flex items-center justify-between font-mono text-slate-500 bg-black/40 p-4 rounded-2xl border border-white/5 italic text-sm">
                      <span>••••••••••••••••••••••••</span>
                      <ShieldCheck size={18} className="text-slate-700" />
                  </div>
                  
                  {/* Educational Tooltip for the User */}
                  <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-3">
                      <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-400/80 leading-relaxed">
                          <strong>Security Notice:</strong> To maintain zero-knowledge security, your API key is only shown once by the Bank Administrator during approval or rotation. If you do not have your key, please request a rotation below.
                      </p>
                  </div>
              </div>
          </div>

          {/* Rotation Request Input */}
          <div className="mt-10 pt-8 border-t border-white/5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Request New Credentials</label>
              <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                      type="text" 
                      placeholder="Reason for rotation (e.g. security update, key lost)..."
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500 transition-all"
                      value={rotateReason}
                      onChange={(e) => setRotateReason(e.target.value)}
                  />
                  <button 
                      onClick={handleRotate}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95 whitespace-nowrap"
                  >
                      Request Rotation
                  </button>
              </div>
          </div>
      </section>

      {/* Section 2: Rotation History */}
      <section className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Clock className="text-slate-400" size={20} />
            Request History
          </h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-black/20 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Requested Date</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.length > 0 ? history.map(req => (
              <tr key={req.id} className="text-sm">
                <td className="px-6 py-4 text-slate-300 font-mono">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-white">{req.reason}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                    req.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    req.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="p-12 text-center text-slate-600 italic">No rotation requests found.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}