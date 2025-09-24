import { useUIStore } from '../../stores/useUIStore';

export function Snackbar() {
  const { snackbar } = useUIStore();

  if (!snackbar.visible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] p-4 rounded-xl shadow-2xl transition-all duration-300 glass ${
      snackbar.type === 'error'
        ? 'border-destructive/50'
        : 'border-green-500/50'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          snackbar.type === 'error' ? 'bg-destructive' : 'bg-green-500'
        }`} />
        <span className="text-sm font-medium">{snackbar.message}</span>
      </div>
    </div>
  );
}
