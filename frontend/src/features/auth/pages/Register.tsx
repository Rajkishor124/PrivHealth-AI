import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register, clearError } from '../authSlice';
import { Shield } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', hospitalCode: '', role: 'PATIENT' as 'DOCTOR' | 'PATIENT' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      toast.success(form.role === 'DOCTOR'
        ? 'Registration successful! Please wait for admin approval.'
        : 'Registration successful! Please sign in.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">PrivHealth <span className="text-teal-600">AI</span></span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Create an account</h2>
          <p className="mt-1 text-sm text-slate-500">Join the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 space-y-5 border border-slate-100">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required placeholder="Min 8 chars, 1 uppercase, 1 digit"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Hospital Code" required placeholder="e.g. LEGACY-001" 
            value={form.hospitalCode} onChange={(e) => setForm({ ...form, hospitalCode: e.target.value })} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">I am a <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {(['PATIENT', 'DOCTOR'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.role === r
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {r === 'PATIENT' ? '🏥 Patient' : '🩺 Doctor'}
                </button>
              ))}
            </div>
            {form.role === 'DOCTOR' && (
              <p className="text-xs text-amber-600 mt-1">Doctor accounts require admin approval before accessing the platform.</p>
            )}
          </div>

          <Button type="submit" isLoading={status === 'loading'} className="w-full">Create Account</Button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
