import React from 'react';
import { StudentAdmission, AdmissionStatus } from '../types';

interface StudentStatusProps {
  admission: StudentAdmission;
}

const StudentStatus: React.FC<StudentStatusProps> = ({ admission }) => {
  const getStatusColor = (status: AdmissionStatus) => {
    switch (status) {
      case AdmissionStatus.APPROVED: return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30';
      case AdmissionStatus.REJECTED: return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30';
      default: return 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-900/30';
    }
  };

  const appliedDate = admission.createdAt ? new Date(admission.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-navy-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-navy-800">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-1">{admission.applicationNumber}</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{admission.fullName}</h2>
          </div>
          <div className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${getStatusColor(admission.status)}`}>
            {admission.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-slate-50 dark:bg-navy-950 rounded-3xl border border-slate-100 dark:border-navy-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Applied Program</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{admission.stream}</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-navy-950 rounded-3xl border border-slate-100 dark:border-navy-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submission Date</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{appliedDate}</p>
          </div>
        </div>

        {admission.status === AdmissionStatus.APPROVED && admission.finalBranch && (
          <div className="bg-emerald-600 text-white p-8 rounded-3xl shadow-lg shadow-emerald-600/20 mb-10">
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2">Allocated Branch</p>
            <p className="text-2xl font-black">{admission.finalBranch}</p>
            <p className="mt-4 text-sm font-medium text-emerald-50">Congratulations! You have been provisionally admitted to Aditya University. Please visit the campus for document verification.</p>
          </div>
        )}

        {admission.status === AdmissionStatus.REJECTED && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 p-8 rounded-3xl mb-10">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Application Rejected</p>
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Your application was not approved at this time. Please contact the admissions office for more information.</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Priorities</p>
          <div className="space-y-2">
            {admission.branches.map((branch, i) => (
              <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center ${admission.finalBranch === branch ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-950'}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800 text-[10px] font-black text-slate-500">{i + 1}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-white">{branch}</span>
                </div>
                {admission.finalBranch === branch && <span className="text-[10px] font-black text-emerald-600 uppercase">Allocated</span>}
              </div>
            ))}
          </div>
        </div>

        {admission.adminNotes && (
          <div className="mt-10 p-6 bg-brand-50/50 dark:bg-brand-900/10 rounded-3xl border border-brand-100 dark:border-brand-900/20">
            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Counselor Notes</p>
            <p className="text-sm font-medium text-slate-700 dark:text-navy-300 italic">"{admission.adminNotes}"</p>
          </div>
        )}

        {admission.aiScore !== undefined && (
          <div className="mt-6 p-6 bg-slate-50 dark:bg-navy-950 rounded-3xl border border-slate-100 dark:border-navy-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Eligibility Score</p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-brand-600">{admission.aiScore}<span className="text-base text-slate-400">/100</span></div>
              <div className="flex-1 bg-slate-200 dark:bg-navy-800 rounded-full h-3">
                <div className="bg-brand-600 h-3 rounded-full transition-all" style={{ width: `${admission.aiScore}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentStatus;
