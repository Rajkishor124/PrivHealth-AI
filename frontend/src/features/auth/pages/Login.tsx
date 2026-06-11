import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login, clearError } from '../authSlice';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard');
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
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 space-y-5 border border-slate-100">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <Input
            label="Email" type="email" required placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="relative">
            <Input
              label="Password" type={showPw ? 'text' : 'password'} required placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" className="absolute right-3 top-8 text-slate-400 hover:text-slate-600" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700">Forgot password?</Link>
          </div>
          <Button type="submit" isLoading={status === 'loading'} className="w-full">Sign In</Button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-medium hover:text-teal-700">Create one</Link>
        </p>
      </div>
    </div>
  );
}
