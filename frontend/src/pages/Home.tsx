import { Link } from 'react-router-dom';
import { Shield, Activity, Lock, Eye, ArrowRight, Stethoscope, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 bg-slate-900/60 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Shield size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">PrivHealth <span className="text-teal-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/25">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
          <Lock size={12} /> Privacy-First Healthcare
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
          AI-Powered Health Risk<br />
          <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Prediction Platform</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Advanced machine learning models with SHAP explainability, AES-256 encryption,
          and HMAC integrity verification. Your health data, protected.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all shadow-xl shadow-teal-500/30 text-sm">
            Start for Free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 border border-slate-600 text-slate-300 font-medium rounded-xl hover:border-slate-400 hover:text-white transition-all text-sm">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Activity, title: 'Risk Predictions', desc: 'RandomForest classifier with 90%+ AUC, real-time risk scoring for cardiovascular conditions.', color: 'from-blue-500 to-indigo-600' },
            { icon: Eye, title: 'SHAP Explanations', desc: 'Understand exactly which factors drive each prediction with interactive SHAP waterfall charts.', color: 'from-teal-500 to-emerald-600' },
            { icon: Lock, title: 'AES-256 Encryption', desc: 'Patient medical history encrypted at rest with AES-GCM. HMAC-SHA256 integrity verification.', color: 'from-purple-500 to-pink-600' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Built for Every Role</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Stethoscope, role: 'Doctors', desc: 'Manage patients, run predictions, view SHAP explanations. Approval-gated access.', badge: 'Clinical' },
            { icon: Shield, role: 'Patients', desc: 'View your health records, track predictions over time, download risk reports.', badge: 'Self-Service' },
            { icon: BarChart3, role: 'Admins', desc: 'Analytics dashboard, doctor approvals, user management, and audit logs.', badge: 'Governance' },
          ].map(({ icon: Icon, role, desc, badge }) => (
            <div key={role} className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Icon size={20} className="text-teal-400" />
                <h3 className="text-lg font-semibold text-white">{role}</h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400">{badge}</span>
              </div>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-sm text-slate-500">© 2024 PrivHealth AI — Privacy-Preserving Healthcare Platform</p>
      </footer>
    </div>
  );
}
