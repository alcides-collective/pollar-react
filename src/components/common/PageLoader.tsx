import { LoadingSpinner } from './LoadingSpinner';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size={48} />
    </div>
  );
}
