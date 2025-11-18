import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirigir al HTML estático
    window.location.href = '/index.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <p>Redirigiendo...</p>
    </div>
  );
}
