import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, seedAdmin } from '../services/api';

type AuthMode = 'login' | 'register';
type UserRole = 'student' | 'admin';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        const res = await loginUser({ email, password });
        data = res.data;
      } else {
        const res = await registerUser({ fullName, email, password, role });
        data = res.data;
      }
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAdmin = async () => {
    try {
      const res = await seedAdmin();
      setSeeded(res.data.message);
    } catch (err: any) {
      setSeeded(err.response?.data?.message || 'Error');
    }
  };

  const inputClasses = "w-full px-5 py-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-navy-500 uppercase tracking-[0.2em] mb-2 ml-1";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-navy-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-navy-800 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-brand-500/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 dark:text-navy-400 font-medium">Access the AdityaNexus Portal</p>
        </div>

        {/* Login / Register Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-navy-800 rounded-2xl mb-6">
          {(['login', 'register'] as AuthMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white dark:bg-navy-700 text-brand-600 shadow-sm' : 'text-slate-500'}`}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Role Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-navy-800 rounded-2xl mb-6">
          {(['student', 'admin'] as UserRole[]).map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === r ? 'bg-white dark:bg-navy-700 text-brand-600 shadow-sm' : 'text-slate-500'}`}>
              {r === 'student' ? 'Student' : 'Administrator'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className={labelClasses}>Full Name</label>
              <input type="text" required placeholder="Your full name" className={inputClasses}
                value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
          )}
          <div>
            <label className={labelClasses}>Email Address</label>
            <input type="email" required placeholder="name@example.com" className={inputClasses}
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className={labelClasses}>Password</label>
            <input type="password" required placeholder="••••••••" className={inputClasses}
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 rounded-2xl flex items-center gap-3">
              <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-bold text-rose-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-60">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* First-time admin seed button */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-navy-800 text-center space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">First time setup?</p>
          <button onClick={handleSeedAdmin}
            className="text-[10px] font-black text-brand-600 hover:underline uppercase tracking-widest">
            Create Default Admin Account
          </button>
          {seeded && <p className="text-[10px] text-emerald-600 font-bold">{seeded}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
