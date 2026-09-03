import { useEffect, useState } from 'react';

function App() {
  const [pesanBackend, setPesanBackend] = useState('Sedang menyambungkan ke Laravel...');
  const [dataProject, setDataProject] = useState(null);

  useEffect(() => {
    // Menembak API Laravel yang sedang menyala di port 8000
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    fetch(`${apiBaseUrl}/tes-koneksi`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setPesanBackend(data.pesan);
        setDataProject(data.data);
      })
      .catch(error => {
        console.error(error);
        setPesanBackend('Gagal terhubung! Pastikan "php artisan serve" di folder Backend menyala.');
      });
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', color: '#333' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#4f46e5', marginTop: 0 }}>Project Ebony (Frontend React)</h1>
        <hr style={{ border: '0', borderTop: '1px solid #e5e7eb', marginBottom: '20px' }} />
        
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>Respon Real-time dari Backend Laravel:</p>
        <div style={{ background: '#e0e7ff', padding: '15px', borderRadius: '5px', fontWeight: 'bold', color: '#1e40af', marginBottom: '20px' }}>
          {pesanBackend}
        </div>
        
        {dataProject && (
          <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '5px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '5px 0' }}><strong>Nama Project:</strong> {dataProject.project_name}</p>
            <p style={{ margin: '5px 0' }}><strong>Developer Backend:</strong> {dataProject.developer_backend}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
