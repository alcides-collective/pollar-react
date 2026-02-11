import { useState, useEffect, useRef } from 'react';

const STATUS_URL = 'https://pollar-backend-production.up.railway.app/api/status';
const POLL_INTERVAL = 60_000; // 1 minute

export function useEngineStatus() {
  const [isDown, setIsDown] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(STATUS_URL, { method: 'GET' });
        setIsDown(!res.ok);
      } catch {
        setIsDown(true);
      }
    };

    check();
    intervalRef.current = setInterval(check, POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, []);

  return isDown;
}
