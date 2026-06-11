import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-8xl font-extrabold bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
