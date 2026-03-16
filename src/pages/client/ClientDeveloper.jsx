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
  const [keyError, setKeyError] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  // Form feedback state
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    let intervalId;

    const loadData = async () => {
      try {
        const [info, logs] = await Promise.all([
          partnerService.getPartnerInfo(),
          partnerService.getRotationHistory()
        ]);
        setPartnerInfo(info);
        setHistory(logs);

        // Check if there is a key waiting to be retrieved
        try {
          console.log("Checking for waiting API key...");
          const keyData = await partnerService.retrieveKey();
          console.log("Response from retrieveKey:", keyData);
          if (keyData && keyData.apiKey) {
            setOneTimeKey(keyData.apiKey);
            setKeyError(null);
          }
        } catch (err) {
          console.error("Error from retrieveKey:", err?.response?.status, err?.response?.data || err.message);
          if (err?.response?.status !== 404) {
            setKeyError(err?.response?.data?.message || err.message);
          }
        }

      } catch (err) {
        console.error("Error loading dev settings", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-refresh every 5 seconds
    intervalId = setInterval(loadData, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleRotate = async () => {
    setFormError('');
    setFormSuccess('');
    if (!rotateReason) {
      setFormError("Please provide a reason for rotation.");
      return;
    }
    try {
      await partnerService.requestRotation(rotateReason);
      setRotateReason('');
      setFormSuccess("Rotation request submitted. Once the Admin approves, your new key will appear here.");
      const logs = await partnerService.getRotationHistory();
      setHistory(logs);

      // Clear success message after 5 seconds
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err) {
      setFormError("Failed to request rotation.");
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

      {/* API CREDENTIALS CARD */}
      <section className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Partner App ID</p>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-white text-sm">
              {partnerInfo?.partnerAppId || '---'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">API Secret Key</p>
              {oneTimeKey && <span className="text-[10px] font-bold text-orange-400 uppercase animate-pulse">Available for 5m</span>}
            </div>
            <div
              onDoubleClick={() => oneTimeKey && setShowSecret(!showSecret)}
              className={`flex items-center justify-between font-mono p-4 rounded-2xl border text-sm transition-colors ${oneTimeKey ? 'bg-orange-500/10 border-orange-500/30 text-white cursor-pointer select-none' : 'bg-black/40 border-white/5 text-slate-500 italic'
                }`}
              title={oneTimeKey ? "Double-click to reveal key" : ""}
            >
              <span className={`break-all ${oneTimeKey && showSecret ? 'select-all' : ''}`}>
                {oneTimeKey
                  ? (showSecret ? oneTimeKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••')
                  : (partnerInfo?.apiKeyIssued ? '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••' : 'No Key Issued')}
              </span>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {oneTimeKey ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(oneTimeKey); alert("API Key copied to clipboard!"); }}
                    className="text-orange-400 hover:text-orange-300 transition-colors p-1"
                    title="Copy Key"
                  >
                    <Copy size={18} />
                  </button>
                ) : (
                  <ShieldCheck size={18} className="text-slate-700" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ROTATION REQUEST */}
        <div className="mt-10 pt-8 border-t border-white/5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Need new credentials?</label>
          <div className="flex gap-3 mb-2">
            <input
              type="text"
              placeholder="Reason for rotation..."
              className={`flex-1 bg-black/30 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors ${formError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-orange-500'
                }`}
              value={rotateReason}
              onChange={(e) => {
                setRotateReason(e.target.value);
                if (formError) setFormError('');
              }}
            />
            <button onClick={handleRotate} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all">
              Request Rotation
            </button>
          </div>
          {formError && <p className="text-red-400 text-xs font-bold px-2 flex items-center gap-1"><AlertTriangle size={12} /> {formError}</p>}
          {formSuccess && <p className="text-emerald-400 text-xs font-bold px-2 flex items-center gap-1"><CheckCircle size={12} /> {formSuccess}</p>}
        </div>
      </section>

      {/* Section 2: Rotation History */}
      {keyError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-300">API Key Retrieval Error</h4>
            <p className="text-sm opacity-90">{keyError}</p>
          </div>
        </div>
      )}
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
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${req.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
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

      {/* Section 3: API Endpoint Documentation */}
      <section className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Shield className="text-slate-400" size={20} />
            API Sandbox Endpoints
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Include your API Key in the <code className="bg-black/40 px-2 py-1 rounded text-orange-400 border border-white/5">X-API-Key</code> HTTP header.</p>
        </div>
        <div className="divide-y divide-white/5">
          {partnerInfo?.endpoints && partnerInfo.endpoints.length > 0 ? (
            partnerInfo.endpoints.map((doc, idx) => (
              <div key={idx} className="p-6 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4 mb-2">
                  <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${doc.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {doc.method}
                  </span>
                  <code className="text-white font-mono text-sm">{doc.path}</code>
                </div>
                <p className="text-slate-300 text-sm ml-16">{doc.description}</p>
                {doc.requiresIdempotencyKey && (
                  <div className="mt-3 ml-16 flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20 w-fit">
                    <AlertTriangle size={14} />
                    Requires <code className="font-bold">Idempotency-Key</code> header
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-600 italic">No endpoint documentation available.</div>
          )}
        </div>
      </section>
    </div>
  );
}