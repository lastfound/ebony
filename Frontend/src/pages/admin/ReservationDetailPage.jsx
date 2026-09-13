import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import { getReservationDetail, updateReservationStatus } from '../../api/adminApi';

export default function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const resDetail = await getReservationDetail(id);
      const data = resDetail?.data || resDetail || null;
      setReservation(data);
      if (data) {
        setSelectedStatus(data.status || 'pending');
      }
    } catch (err) {
      console.error("Error loading detail:", err);
      alert('Gagal memuat detail reservasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setSavingStatus(true);
    try {
      await updateReservationStatus(id, newStatus);
      setReservation(prev => (prev ? { ...prev, status: newStatus } : null));
      alert('Status reservasi berhasil diperbarui!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const formatWaNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const getWaUrl = () => {
    if (!reservation?.phone) return '#';
    const num = formatWaNumber(reservation.phone);
    const currentStatus = (selectedStatus || reservation.status || 'PENDING').toUpperCase();

    // Teks penutup dinamis menyesuaikan status
    let closingMessage = '';
    switch (currentStatus) {
      case 'CONFIRMED':
      case 'APPROVED':
        closingMessage = 'Kami sangat menantikan kedatangan Anda. Sampai jumpa di Ebony Cafe & Gallery! ✨';
        break;

      case 'CANCELLED':
      case 'REJECTED':
        closingMessage = 'Mohon maaf atas ketidaknyamanannya. Semoga kami dapat melayani Anda di kesempatan lain! ';
        break;

      case 'PENDING':
        closingMessage = 'Mohon tunggu sebentar, tim kami sedang mengecek ketersediaan meja untuk Anda. ';
        break;

      case 'SEATED':
        closingMessage = 'Selamat menikmati hidangan dan suasana di Ebony Cafe & Gallery!';
        break;

      case 'COMPLETED':
        closingMessage = 'Terima kasih telah berkunjung ke Ebony Cafe & Gallery! Semoga pengalaman Anda menyenangkan. ';
        break;

      default:
        closingMessage = 'Terima kasih telah menghubungi Ebony Cafe & Gallery!';
    }

    const msg = encodeURIComponent(
      `Halo Kak ${reservation.guest_name || reservation.name || ''},\n\n` +
      `Kami dari Admin *Ebony Cafe & Gallery* ingin mengonfirmasi reservasi Anda:\n` +
      `• Kode Booking: #${reservation.booking_number || reservation.id}\n` +
      `• Tanggal: ${reservation.formatted_date || reservation.date}\n` +
      `• Jam: ${reservation.time}\n` +
      `• Jumlah Tamu: ${reservation.party_size} Orang\n\n` +
      `Status reservasi Anda saat ini: *${currentStatus}*.\n\n` +
      `${closingMessage}`
    );

    return `https://wa.me/${num}?text=${msg}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner />
          <p style={{ marginTop: '12px', color: '#888' }}>Memuat detail reservasi...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!reservation) {
    return (
      <AdminLayout>
        <div style={{ padding: '40px 0' }}>
          <h2>Reservasi tidak ditemukan.</h2>
          <button className="btn btn--outline-dark" onClick={() => navigate('/admin/reservations')}>
            ← Kembali ke Daftar Reservasi
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/admin/reservations')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.85rem', fontWeight: 600 }}
        >
          ← BACK TO RESERVATIONS
        </button>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <span className="page-label">RESERVATION DETAIL</span>
          <h1 className="page-title page-title--italic" style={{ margin: '4px 0' }}>
            #{reservation.booking_number || `RSV-${reservation.id}`}
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Didaftarkan pada: {reservation.created_at || 'Baru Saja'}
          </p>
        </div>

        <a 
          href={getWaUrl()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn"
          style={{
            backgroundColor: '#25D366',
            color: '#fff',
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}
        >
          💬 Chat WhatsApp Customer
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Kolom Kiri: Detail Informasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              Informasi Tamu & Jadwal
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>NAMA TAMU</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>{reservation.guest_name || reservation.name || '-'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>NOMOR TELEPON / WA</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>{reservation.phone || '-'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>EMAIL</label>
                <div style={{ fontSize: '0.95rem', color: '#444' }}>{reservation.email || '-'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>OCCASION / EVENT</label>
                <div style={{ fontSize: '0.95rem', color: '#444' }}>{reservation.occasion || 'General Dining'}</div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #eee', margin: '16px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>TANGGAL</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>
                  {reservation.formatted_date || reservation.date || '-'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>JAM</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>{reservation.time || '-'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>JUMLAH TAMU</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>👥 {reservation.party_size || 0} Guests</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              Catatan Khusus
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, display: 'block' }}>CATATAN DIETARY / ALERGI</label>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#444' }}>
                {reservation.dietary_notes || reservation.notes || 'Tidak ada catatan khusus.'}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: UBAH STATUS RESERVASI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#1a1a1a' }}>Ubah Status Reservasi</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <select 
                value={selectedStatus} 
                onChange={handleStatusChange}
                disabled={savingStatus}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  backgroundColor: '#fdfdfd'
                }}
              >
                <option value="pending">⏳ Pending (Menunggu)</option>
                <option value="confirmed">✅ Confirmed (Dikonfirmasi)</option>
                <option value="seated">🪑 Seated (Sudah Datang)</option>
                <option value="completed">🎉 Completed (Selesai)</option>
                <option value="cancelled">❌ Cancelled (Dibatalkan)</option>
              </select>
            </div>

            {savingStatus && <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Menyimpan status...</p>}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}