interface SejmApiErrorProps {
  message?: string;
}

export function SejmApiError({ message = 'API Sejmu jest tymczasowo niedostępne' }: SejmApiErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div className="text-red-600 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-red-800 font-medium mb-1">Błąd połączenia</h3>
      <p className="text-red-600 text-sm">{message}</p>
      <p className="text-red-500 text-xs mt-2">
        Spróbuj odświeżyć stronę za chwilę
      </p>
    </div>
  );
}
