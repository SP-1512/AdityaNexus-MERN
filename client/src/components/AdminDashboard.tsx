import React, { useState, useEffect } from 'react';
import { StudentAdmission, DashboardSummary, EligibilityAnalysis, AdmissionStatus } from '../types';
import { updateAdmission, analyzeAdmission, summarizeBatch } from '../services/api';

interface AdminDashboardProps {
  admissions: StudentAdmission[];
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admissions, onRefresh }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<StudentAdmission | null>(null);
  const [analysis, setAnalysis] = useState<EligibilityAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [chosenBranch, setChosenBranch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      if (admissions.length === 0) return;
      setLoadingSummary(true);
      try {
        const { data } = await summarizeBatch(admissions);
        setSummary(data);
      } catch { /* silent */ }
      finally { setLoadingSummary(false); }
    };
    fetchSummary();
  }, [admissions]);

  const handleSelect = async (admission: StudentAdmission) => {
    setSelectedAdmission(admission);
    setAnalysis(null);
    setChosenBranch(admission.finalBranch || admission.branches[0]);

    if (admission.aiScore !== undefined) {
      setAnalysis({
        isValid: admission.status === AdmissionStatus.APPROVED,
        errors: [], eligibilityScore: admission.aiScore || 0,
        suggestedStatus: admission.status,
        reason: admission.aiReason || '',
        adminNoteDraft: admission.adminNotes || '',
        reservationCompliance: admission.aiCompliance || ''
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await analyzeAdmission(admission);
      setAnalysis(data);
      if (data.suggestedBranch) setChosenBranch(data.suggestedBranch);
    } catch { /* silent */ }
    finally { setAnalyzing(false); }
  };

const handleDecision = async (status: AdmissionStatus) => {
    if (!selectedAdmission) return;
    const noteEl = document.getElementById('adminNoteField') as HTMLTextAreaElement;
    setSaving(true);
    try {
      await updateAdmission(selectedAdmission._id, {
        status,
        adminNotes: noteEl?.value || '',
        finalBranch: status === AdmissionStatus.APPROVED ? chosenBranch : undefined,
        aiScore: analysis?.eligibilityScore,
        aiReason: analysis?.reason,
        aiCompliance: analysis?.reservationCompliance
      });
      onRefresh();
      setSelectedAdmission(null);
      setAnalysis(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };
  

  const downloadRegistry = () => {
    if (admissions.length === 0) return;
    const escapeCSV = (val: any) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const headers = ["Application ID","Full Name","Email","Stream","Branch Priorities","Approved Branch","Status","12th Score (%)","10th Score (%)","Category","Entrance Exam","Entrance Score","Submission Date","Admin Notes"];
    const rows = admissions.map(a => [
      escapeCSV(a.applicationNumber), escapeCSV(a.fullName), escapeCSV(a.email),
      escapeCSV(a.stream), escapeCSV(a.branches.join(' | ')), escapeCSV(a.finalBranch || 'Not Allocated'),
      escapeCSV(a.status), escapeCSV(a.twelfthPercentage), escapeCSV(a.tenthPercentage),
      escapeCSV(a.category), escapeCSV(a.entranceExam || 'N/A'), escapeCSV(a.entranceScore || 0),
      escapeCSV(new Date(a.createdAt).toLocaleString()), escapeCSV(a.adminNotes || '')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `adityanexus_registry_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    link.click();
  };

  const getStatusClasses = (status: string) => {
    if (status === 'Approved') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
    if (status === 'Rejected') return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400';
    return 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 bg-white dark:bg-navy-900 p-8 rounded-[2rem] border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Applicants</p>
          <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{admissions.length}</p>
          <div className="mt-4 flex items-center gap-2 text-brand-600 text-[10px] font-black uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            MongoDB Atlas
          </div>
        </div>
        <div className="md:col-span-9 bg-brand-600 text-white p-8 rounded-[2rem] shadow-xl shadow-brand-600/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-brand-50 uppercase tracking-[0.2em] mb-4">Batch Intelligence (Gemini AI)</p>
            {loadingSummary ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                {summary?.keyObservations.map((obs, i) => (
                  <div key={i} className="flex gap-3 items-center bg-white/10 p-4 rounded-2xl border border-white/5">
                    <span className="text-xl">💡</span><span>{obs}</span>
                  </div>
                ))}
                {admissions.length === 0 && <p className="opacity-70 italic">Awaiting enrollment data.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: admissions.filter(a => a.status === 'Pending').length, color: 'text-brand-600' },
          { label: 'Approved', count: admissions.filter(a => a.status === 'Approved').length, color: 'text-emerald-600' },
          { label: 'Rejected', count: admissions.filter(a => a.status === 'Rejected').length, color: 'text-rose-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-navy-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-navy-800 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 rounded-[2rem] border border-slate-200 dark:border-navy-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex justify-between items-center">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">Counseling Registry</h3>
            <button onClick={downloadRegistry} disabled={admissions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-navy-950/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">App No & Student</th>
                  <th className="px-6 py-4">Primary Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {admissions.map(adm => (
                  <tr key={adm._id} className={`hover:bg-slate-50/80 dark:hover:bg-navy-800/50 transition-colors ${selectedAdmission?._id === adm._id ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="text-[9px] font-black text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full inline-block mb-1">{adm.applicationNumber}</div>
<div className="font-bold text-slate-900 dark:text-white">{adm.fullName}</div>
<div className="text-[9px] font-bold text-slate-400 uppercase">{adm.category}</div>

{/* Personal Info */}
<div className="mt-2 space-y-0.5">
 <div className="text-[10px] text-slate-500 dark:text-navy-300">Email: {adm.email}</div>
<div className="text-[10px] text-slate-500 dark:text-navy-300">Phone: {adm.phone}</div>
</div>

{/* Academic Details */}
<div className="mt-2 space-y-0.5">
  <div className="text-[10px] text-slate-500 dark:text-navy-300">12th: <span className="font-bold">{adm.twelfthPercentage}%</span> &nbsp;|&nbsp; 10th: <span className="font-bold">{adm.tenthPercentage}%</span></div>
<div className="text-[10px] text-slate-500 dark:text-navy-300">Board: <span className="font-bold">{adm.twelfthBoard}</span></div>
{adm.entranceExam && <div className="text-[10px] text-slate-500 dark:text-navy-300">{adm.entranceExam}: <span className="font-bold">{adm.entranceScore}</span></div>}
</div>

{/* Branch Preferences */}
<div className="mt-2"><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Branches</div>
  
  <div className="flex flex-wrap gap-1">
    {adm.branches.map((b, i) => (
      <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-navy-300 rounded-full">
        {i + 1}. {b}
      </span>
    ))}
  </div>
</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700 dark:text-navy-200">{adm.status === AdmissionStatus.APPROVED ? adm.finalBranch : adm.branches[0]}</div>
                      {adm.status !== AdmissionStatus.APPROVED && <div className="text-[9px] text-slate-400 font-bold italic">+ {adm.branches.length - 1} choices</div>}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusClasses(adm.status)}`}>{adm.status}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => handleSelect(adm)}
                        className="bg-slate-100 dark:bg-navy-800 hover:bg-brand-600 text-slate-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {admissions.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">No applications received yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-[2rem] border border-slate-200 dark:border-navy-800 p-8 shadow-xl">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6"><span className="text-brand-600">Decision</span> Logic</h3>
          {!selectedAdmission ? (
            <div className="flex flex-col items-center justify-center h-80 text-center opacity-40">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm font-bold uppercase tracking-widest">Select Applicant</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-navy-800 pb-6">
                <div className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-1">{selectedAdmission.applicationNumber}</div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedAdmission.fullName}</h4>
                <p className="text-xs text-slate-400 mt-1">{selectedAdmission.email}</p>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Allocation</p>
                {selectedAdmission.branches.map((b, i) => (
                  <button key={i} onClick={() => setChosenBranch(b)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${chosenBranch === b ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500/20' : 'border-slate-200 dark:border-navy-800 opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${chosenBranch === b ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-navy-800 text-slate-500'}`}>{i + 1}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-navy-200">{b}</span>
                    </div>
                    {analysis?.suggestedBranch === b && <span className="text-[9px] font-black uppercase text-brand-600 animate-pulse">AI Choice</span>}
                  </button>
                ))}
              </div>

              {analyzing ? (
                <div className="h-32 bg-slate-50 dark:bg-navy-800/50 rounded-3xl animate-pulse flex items-center justify-center">
                  <p className="text-xs font-black uppercase text-slate-400">AI Analyzing...</p>
                </div>
              ) : (
                <>
                  <div className="bg-brand-50/50 dark:bg-brand-900/10 p-5 rounded-3xl border border-brand-100 dark:border-brand-900/20">
                    <p className="text-[10px] font-black text-brand-700 uppercase tracking-widest mb-2">AI Counseling Insight</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-navy-300 leading-relaxed italic">
                      {analysis?.reason || 'Processing eligibility report...'}
                    </p>
                    {analysis?.eligibilityScore !== undefined && (
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs font-black text-brand-600">{analysis.eligibilityScore}/100</span>
                        <div className="flex-1 bg-brand-100 dark:bg-brand-900/30 rounded-full h-2">
                          <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${analysis.eligibilityScore}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Administrative Notes</p>
                    <textarea id="adminNoteField"
                      className="w-full text-sm font-medium p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl h-24 outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Add institutional instructions..."
                      defaultValue={selectedAdmission.adminNotes || analysis?.adminNoteDraft} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleDecision(AdmissionStatus.APPROVED)} disabled={saving}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-60">
                      {saving ? '...' : 'Approve'}
                    </button>
                    <button onClick={() => handleDecision(AdmissionStatus.REJECTED)} disabled={saving}
                      className="flex-1 bg-rose-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg disabled:opacity-60">
                      {saving ? '...' : 'Reject'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
