import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { forgotPassword, clearError } from '../authSlice';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={48} className="text-teal-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-500 mb-6">If an account exists with that email, we've sent a password reset link. Check the console logs for the link (development mode).</p>
          <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Reset password</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-slate-100">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" isLoading={status === 'loading'} className="w-full">Send Reset Link</Button>
        </form>
        <p className="text-center mt-6"><Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft size={14} /> Back to login</Link></p>
      </div>
    </div>
  );
}
