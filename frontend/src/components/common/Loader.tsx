import { Loader2 } from 'lucide-react';

interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
}

export default function Loader({ fullScreen = false, size = 32 }: LoaderProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <Loader2 size={size} className="animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={size} className="animate-spin text-teal-600" />
    </div>
  );
}
