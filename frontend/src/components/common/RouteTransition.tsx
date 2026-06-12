import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350); // Premium smooth duration for a high-end feel

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative min-h-[calc(100vh-10rem)] w-full">
      {/* Premium Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-20 sm:justify-center sm:pt-0 bg-slate-50/65 backdrop-blur-[4px] z-50 transition-all duration-300">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/90 shadow-xl border border-slate-100/80 max-w-xs w-full mx-4 transform scale-100 transition-transform duration-300">
            <div className="relative w-14 h-14">
              {/* Outer pulsing glow */}
              <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping duration-1000" />
              {/* Inner track ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              {/* Spinning active ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-600 border-r-teal-600 animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-bold text-slate-800 tracking-wide">Loading Page</span>
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest animate-pulse">PrivHealth AI</span>
            </div>
          </div>
        </div>
      )}
      
      <div 
        className={`w-full transition-all duration-500 ease-out ${
          loading 
            ? 'opacity-25 blur-[2px] pointer-events-none translate-y-3' 
            : 'opacity-100 blur-0 translate-y-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
