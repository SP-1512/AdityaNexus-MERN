import React, { useState, useEffect } from 'react';
import { StudentAdmission, Category } from '../types';
import { createAdmission } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STREAM_DATA: Record<string, string[]> = {
  "School of Engineering": [
    "Civil Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Electronics and Communication Engineering",
    "Agricultural Engineering",
    "Mining Engineering",
    "Petroleum Technology",
    "Computer Applications",
    "Data Science",
    "Information Technology",
    "Computer Science Engineering",
    "Artificial Intelligence & Machine Learning"
  ],
  "School of Business": [
    "BBA in knowledge partnership with Deloitte",
    "BBA (Business Analytics) in knowledge partnership with KPMG",
    "BBA (Global Finance) in knowledge partnership with PWC",
    "BBA (FinTech) in knowledge partnership with EY",
    "BBA (Health Care Management) in knowledge partnership with Red Varsity",
    "MBA in knowledge partnership with Deloitte",
    "MBA (Business Analytics) in knowledge partnership with KPMG",
    "MBA (Global Finance) in knowledge partnership with PWC",
    "MBA (FinTech) in knowledge partnership with EY",
    "MBA (Health Care Management) in knowledge partnership with Red Varsity",
    "MBA for Working Professionals",
    "Ph.D"
  ],
  "School of Sciences": [
    "B.Sc. Forensic Science",
    "B.Sc. Cyber Security and Digital Forensics",
    "M.Sc. Forensic Science",
    "M.Sc. Cyber Security and Digital Forensics"
  ],
  "School of Pharmacy": [
    "B.Pharmacy",
    "Pharm D",
    "M.Pharmacy (Pharmaceutics)",
    "M.Pharmacy (Pharmaceutical Analysis)"
  ]
};
const STREAMS = Object.keys(STREAM_DATA);
const BOARDS = ["CBSE","ICSE","AP State Board (BIEAP)","TS State Board (TSBIE)","Maharashtra State Board (HSC)","Karnataka State Board (PUC)","Tamil Nadu State Board","NIOS","Other"];
const CATEGORIES: Category[] = ["General","OBC-NCL","SC","ST","EWS"];
const ENTRANCE_EXAMS = ["None","JEE Main","JEE Advanced","AP EAMCET (EAPCET)","TS EAMCET","NEET","KCET","MHT CET","CUET (UG)","GPAT","MAT","CAT","GMAT"];
interface AdmissionFormProps {
  onSubmitted: (admission: StudentAdmission) => void;
}

const AdmissionForm: React.FC<AdmissionFormProps> = ({ onSubmitted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    stream: STREAMS[0],
    branches: [] as string[],
    twelfthBoard: BOARDS[0],
    twelfthPercentage: 0,
    tenthPercentage: 0,
    category: CATEGORIES[0] as Category,
    entranceExam: 'None',
    entranceScore: 0
  });

  useEffect(() => { setFormData(prev => ({ ...prev, branches: [] })); }, [formData.stream]);

  const toggleBranch = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.includes(branch) ? prev.branches.filter(b => b !== branch) : [...prev.branches, branch]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.branches.length === 0) { setError('Please select at least one branch priority.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await createAdmission(formData);
      onSubmitted(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAllSelected = formData.branches.length === STREAM_DATA[formData.stream].length;
  const inputClasses = "w-full px-5 py-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-navy-500 uppercase tracking-[0.2em] mb-2 ml-1";

  return (
    <div className="bg-white dark:bg-navy-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-navy-800 animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Student Enrollment</h2>
        <p className="text-slate-500 dark:text-navy-400 font-medium">Multi-Priority Application | Aditya University</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Full Name (Per Certificates)</label>
            <input type="text" required placeholder="Ex: Amit Varma" className={inputClasses}
              value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Email Address</label>
            <input type="email" required placeholder="student@example.com" className={inputClasses}
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Phone Number</label>
            <input type="tel" required placeholder="Ex: 9876543210" maxLength={10} className={inputClasses}
              value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
          </div>
        </div>

        <div className="bg-brand-50/30 dark:bg-brand-950/20 p-8 rounded-[2rem] border border-brand-100 dark:border-brand-900/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">Program & Branch Priorities</p>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full relative transition-colors ${isAllSelected ? 'bg-brand-600' : 'bg-slate-300 dark:bg-navy-700'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isAllSelected ? 'translate-x-5' : 'translate-x-1'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={isAllSelected}
                onChange={e => setFormData(prev => ({ ...prev, branches: e.target.checked ? [...STREAM_DATA[prev.stream]] : [] }))} />
              <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-brand-600 transition-colors">Select all branches</span>
            </label>
          </div>
          <div>
            <label className={labelClasses}>Primary Stream</label>
            <select className={`${inputClasses} appearance-none cursor-pointer`} value={formData.stream}
              onChange={e => setFormData({ ...formData, stream: e.target.value })}>
              {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Select Branches in Priority Order</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {STREAM_DATA[formData.stream].map(branch => {
                const priority = formData.branches.indexOf(branch) + 1;
                const isSelected = priority > 0;
                return (
                  <button key={branch} type="button" onClick={() => toggleBranch(branch)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${isSelected ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 shadow-sm ring-1 ring-brand-500/20' : 'border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 hover:border-brand-300'}`}>
                    <span className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{branch}</span>
                    {isSelected && <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-black">{priority}</span>}
                  </button>
                );
              })}
            </div>
            {formData.branches.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 p-4 bg-white/50 dark:bg-navy-900/50 rounded-2xl border border-dashed border-brand-200 dark:border-brand-900/30">
                <p className="text-[9px] font-black text-brand-500 uppercase w-full mb-1">Your Priority List:</p>
                {formData.branches.map((b, i) => (
                  <span key={b} className="text-[10px] font-bold text-slate-600 dark:text-navy-300 bg-slate-100 dark:bg-navy-800 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="text-brand-600">#{i + 1}</span> {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Quota/Category</label>
            <select className={`${inputClasses} appearance-none cursor-pointer`} value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as Category })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>12th Board</label>
            <select className={`${inputClasses} appearance-none cursor-pointer`} value={formData.twelfthBoard}
              onChange={e => setFormData({ ...formData, twelfthBoard: e.target.value })}>
              {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-navy-950 p-6 rounded-3xl border border-slate-100 dark:border-navy-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Academic Aggregate (%)</p>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block">Class 10th</label>
                <input type="number" required min="0" max="100" step="0.01" className={inputClasses}
                  value={formData.tenthPercentage} onChange={e => setFormData({ ...formData, tenthPercentage: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block">Class 12th</label>
                <input type="number" required min="0" max="100" step="0.01" className={inputClasses}
                  value={formData.twelfthPercentage} onChange={e => setFormData({ ...formData, twelfthPercentage: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <div className="bg-brand-50/50 dark:bg-brand-900/10 p-6 rounded-3xl border border-brand-100 dark:border-brand-900/20">
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-4">Entrance Verification</p>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block">Entrance Test</label>
                <select className={`${inputClasses} text-sm`} value={formData.entranceExam}
                  onChange={e => setFormData({ ...formData, entranceExam: e.target.value })}>
                  {ENTRANCE_EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block">Rank / Score</label>
                <input type="number" step="0.01" placeholder="Ex: 5400" className={inputClasses}
                  value={formData.entranceScore} onChange={e => setFormData({ ...formData, entranceScore: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 rounded-2xl">
            <p className="text-xs font-bold text-rose-600">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-brand-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 active:scale-[0.98] mt-4 uppercase tracking-widest text-sm disabled:opacity-60">
          {loading ? 'Submitting...' : 'Confirm Application'}
        </button>
      </form>
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-navy-800 flex items-center justify-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Powered by MongoDB Atlas</span>
      </div>
    </div>
  );
};

export default AdmissionForm;
