interface SejmApiErrorProps {
  message?: string;
}

export function SejmApiError({ message = 'API Sejmu jest tymczasowo niedostępne' }: SejmApiErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div className="text-red-600 mb-2">
        <i className="ri-error-warning-line text-3xl" />
      </div>
      <h3 className="text-red-800 font-medium mb-1">Błąd połączenia</h3>
      <p className="text-red-600 text-sm">{message}</p>
      <p className="text-red-500 text-xs mt-2">
        Spróbuj odświeżyć stronę za chwilę
      </p>
    </div>
  );
}
