import React, { useState, useEffect } from 'react';
import { partnerService } from '../../api';
import { Key, RefreshCw, Clock, ShieldCheck, AlertTriangle, Shield, Copy, CheckCircle } from 'lucide-react';

export default function ClientDeveloper() {
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotateReason, setRotateReason] = useState('');
  
  // NEW STATE: One-time key storage
  const [oneTimeKey, setOneTimeKey] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [info, logs] = await Promise.all([
          partnerService.getPartnerInfo(),
          partnerService.getRotationHistory()
        ]);
        setPartnerInfo(info);
        setHistory(logs);

        // NEW: Check if there is a key waiting to be retrieved
        try {
            const keyData = await partnerService.retrieveKey();
            if (keyData && keyData.key) {
                setOneTimeKey(keyData.key);
                setShowKeyModal(true);
            }
        } catch (err) {
            // If 404 or error, it means key was already retrieved. 
            // We ignore it and show the standard "Hidden" UI.
            console.log("No new key available for retrieval.");
        }

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
    try {
      await partnerService.requestRotation(rotateReason);
      setRotateReason('');
      alert("Rotation request submitted. Once the Admin approves, your new key will appear here on your next visit.");
      const logs = await partnerService.getRotationHistory();
      setHistory(logs);
    } catch (err) {
      alert("Failed to request rotation.");
    }
  };

  if (loading) return <div className="p-8 text-white">Loading Developer Console...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* HEADER SECTION */}
      <header>
        <h1 className="text-3xl font-bold text-white">{partnerInfo?.appName || 'Developer Console'}</h1>
        <p className="text-slate-400">Manage your API credentials and security status.</p>
      </header>

      {/* ONE-TIME SECRET MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-slate-900 border-2 border-orange-500/50 rounded-3xl p-10 w-full max-w-xl shadow-[0_0_50px_rgba(249,115,22,0.2)] text-center">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Shield size={40} className="text-orange-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Your API Key is Ready</h2>
                <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-6 italic">
                    Show this once and store it safely. You won't be able to fetch it again.
                </p>
                
                <div className="bg-black/50 border border-white/10 rounded-2xl p-6 w-full mb-8">
                    <code className="text-2xl text-white font-mono break-all block select-all">
                        {oneTimeKey}
                    </code>
                </div>

                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(oneTimeKey);
                        alert("API Key copied to clipboard!");
                    }}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mb-4"
                >
                    <Copy size={20} />
                    Copy Secret Key
                </button>
                
                <button 
                    onClick={() => setShowKeyModal(false)} 
                    className="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase underline"
                >
                    I have saved it, close this window
                </button>
            </div>
        </div>
      )}

      {/* API CREDENTIALS CARD */}
      <section className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Partner App ID</p>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-white text-sm">
                      {partnerInfo?.id || '---'}
                  </div>
              </div>

              <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">API Secret Key</p>
                  <div className="flex items-center justify-between font-mono text-slate-500 bg-black/40 p-4 rounded-2xl border border-white/5 italic text-sm">
                      <span>••••••••••••••••••••••••</span>
                      <ShieldCheck size={18} className="text-slate-700" />
                  </div>
              </div>
          </div>

          {/* ROTATION REQUEST */}
          <div className="mt-10 pt-8 border-t border-white/5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Need new credentials?</label>
              <div className="flex gap-3">
                  <input 
                      type="text" 
                      placeholder="Reason for rotation..."
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500"
                      value={rotateReason}
                      onChange={(e) => setRotateReason(e.target.value)}
                  />
                  <button onClick={handleRotate} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all">
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