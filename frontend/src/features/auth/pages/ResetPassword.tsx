import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { resetPassword, clearError } from '../authSlice';
import { Shield } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { status, error } = useAppSelector((s) => s.auth);
  const [pw, setPw] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(resetPassword({ token, newPassword: pw }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield size={40} className="text-teal-600 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Set new password</h2>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-slate-100">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
          <Input label="New Password" type="password" required placeholder="Min 8 chars, 1 uppercase, 1 digit"
            value={pw} onChange={(e) => setPw(e.target.value)} />
          <Button type="submit" isLoading={status === 'loading'} className="w-full">Reset Password</Button>
        </form>
        <p className="text-center mt-6"><Link to="/login" className="text-sm text-slate-500 hover:text-slate-700">Back to login</Link></p>
      </div>
    </div>
  );
}
