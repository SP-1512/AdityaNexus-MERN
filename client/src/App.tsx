import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import AdmissionForm from './components/AdmissionForm';
import AdminDashboard from './components/AdminDashboard';
import StudentStatus from './components/StudentStatus';
import { StudentAdmission } from './types';
import { getAdmissions } from './services/api';

type Tab = 'home' | 'apply' | 'admin' | 'login' | 'status';

const AppContent: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [admissions, setAdmissions] = useState<StudentAdmission[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  const fetchAdmissions = async () => {
    if (!user) return;
    try {
      const { data } = await getAdmissions();
      setAdmissions(data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (user) {
      fetchAdmissions();
      if (user.role === 'admin') setActiveTab('admin');
      else setActiveTab('status');
    } else {
      setActiveTab('home');
      setAdmissions([]);
    }
  }, [user]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const studentAdmission = admissions.find(a => a.email === user?.email);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Loading AdityaNexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Aditya<span className="text-brand-600">Nexus</span></span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              <button onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'home' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}>
                Home
              </button>

              {user?.role === 'admin' && (
                <button onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'admin' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}>
                  Console
                </button>
              )}

              {user?.role === 'student' && (
                <>
                  <button onClick={() => setActiveTab('apply')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'apply' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}>
                    Enroll
                  </button>
                  <button onClick={() => setActiveTab('status')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'status' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}>
                    My Status
                  </button>
                </>
              )}

              {!user && (
                <button onClick={() => setActiveTab('login')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'login' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'}`}>
                  Sign In
                </button>
              )}

              {user && (
                <>
                  <span className="text-xs font-bold text-slate-400 px-2">Hi, {user.fullName.split(' ')[0]}</span>
                  <button onClick={logout}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                    Logout
                  </button>
                </>
              )}

              <div className="h-6 w-px bg-slate-200 dark:bg-navy-800 mx-2"></div>
              <button onClick={toggleDarkMode}
                className="p-2 rounded-full text-slate-500 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors">
                {isDarkMode
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 17.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* HOME */}
        {activeTab === 'home' && (
          <div className="space-y-20">
            <div className="max-w-4xl mx-auto text-center space-y-8 py-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                </span>
                Admission Portals Live · MongoDB Powered
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Empowering the <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">Indian Scholar</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-navy-400 leading-relaxed max-w-2xl mx-auto">
                Next-generation admission intelligence for B.Tech, BBA, and beyond. Unified counseling with priority-based enrollment and AI validation.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button onClick={() => user ? setActiveTab('apply') : setActiveTab('login')}
                  className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/30 hover:-translate-y-1">
                  Apply Now
                </button>
                <button onClick={() => user?.role === 'admin' ? setActiveTab('admin') : setActiveTab('login')}
                  className="bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-200 border border-slate-200 dark:border-navy-800 px-10 py-4 rounded-2xl font-bold hover:bg-brand-50 dark:hover:bg-navy-800 transition-all shadow-sm hover:-translate-y-1">
                  Console Access
                </button>
              </div>
            </div>

            <section className="space-y-12 py-10">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">About Aditya University</h2>
                <p className="text-slate-500 dark:text-navy-400 max-w-2xl mx-auto">A legacy of excellence in higher education, fostering innovation and leadership for over two decades.</p>
              </div>
              <div className="max-w-3xl mx-auto bg-brand-50 dark:bg-brand-950/20 p-8 rounded-[2rem] border border-brand-100 dark:border-brand-900/30">
                <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] border-b border-brand-100 dark:border-brand-900/30 pb-3 mb-4">Institutional Pillars</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Priority Branch Counseling","Industry-Aligned Global Curriculum","AI-Driven Application Registry","MongoDB-Backed Data Persistence"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-slate-700 dark:text-navy-300 text-sm font-semibold">
                      <div className="w-6 h-6 rounded-full bg-brand-200 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        {/* APPLY */}
        {activeTab === 'apply' && (
          <div className="max-w-3xl mx-auto py-6 animate-fade-in">
            {user?.role === 'student' ? (
              studentAdmission ? (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-black mb-4 dark:text-white">Application Already Submitted</h2>
                  <p className="text-slate-500 mb-8">You have already submitted an application. Check your status below.</p>
                  <button onClick={() => setActiveTab('status')} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">View Status</button>
                </div>
              ) : (
                <AdmissionForm onSubmitted={(a) => { setAdmissions(prev => [a, ...prev]); setActiveTab('status'); }} />
              )
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-black mb-4 dark:text-white">Please Sign In</h2>
                <p className="text-slate-500 mb-8">You need to be signed in as a student to apply.</p>
                <button onClick={() => setActiveTab('login')} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">Sign In Now</button>
              </div>
            )}
          </div>
        )}

        {/* ADMIN */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            {user?.role === 'admin' ? (
              <AdminDashboard admissions={admissions} onRefresh={fetchAdmissions} />
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-black mb-4 dark:text-white">Restricted Access</h2>
                <p className="text-slate-500 mb-8">This area is reserved for administrators.</p>
                <button onClick={() => setActiveTab('login')} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">Admin Login</button>
              </div>
            )}
          </div>
        )}

        {/* LOGIN */}
        {activeTab === 'login' && <LoginPage />}

        {/* STATUS */}
        {activeTab === 'status' && (
          <div className="py-6">
            {user?.role === 'student' ? (
              studentAdmission ? (
                <StudentStatus admission={studentAdmission} />
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-black mb-4 dark:text-white">No Application Found</h2>
                  <p className="text-slate-500 mb-8">You haven't submitted an application yet.</p>
                  <button onClick={() => setActiveTab('apply')} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">Apply Now</button>
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-black mb-4 dark:text-white">Please Sign In</h2>
                <button onClick={() => setActiveTab('login')} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">Sign In Now</button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-navy-950 text-slate-400 py-16 border-t border-slate-200 dark:border-navy-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-lg font-bold text-slate-800 dark:text-white">AdityaNexus</span>
          <p className="text-[10px] font-medium uppercase tracking-widest">MERN Stack · MongoDB Atlas · Gemini AI · AICTE/UGC Compliant © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
