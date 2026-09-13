import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Modal from '../../components/ui/Modal';
import { getReservations, exportReservationsCSV, createReservation } from '../../api/adminApi';

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const PER_PAGE = 4;

  // State terpisah untuk Form Modal
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('00');

  const fetchReservations = () => {
    getReservations({ page, per_page: PER_PAGE })
      .then(res => {
        const dataList = res.data?.data || res.data || [];
        setReservations(dataList);
        setTotal(res.total || res.data?.total || dataList.length);
        setLastPage(res.last_page || res.data?.last_page || 1);
      })
      .catch(() => setReservations([]));
  };

  useEffect(() => {
    fetchReservations();
  }, [page]);

  // Reset state waktu saat modal ditutup/dibuka
  const handleOpenModal = () => {
    setSelectedDate('');
    setSelectedHour('');
    setSelectedMinute('00');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate('');
    setSelectedHour('');
    setSelectedMinute('00');
  };

  // Menentukan opsi jam operasional Ebony Cafe berdasarkan tanggal
  const getHourOptions = (dateString) => {
    if (!dateString) return [];
    
    const day = new Date(dateString).getDay();
    if (day === 1) return []; // Senin Tutup

    const isWeekend = day === 0 || day === 6;
    const startHour = isWeekend ? 11 : 12; // Weekend 11:00 AM, Weekday 12:00 PM
    const endHour = 22; // 10:00 PM

    const hours = [];
    for (let h = startHour; h <= endHour; h++) {
      const val = h.toString().padStart(2, '0');
      let label = '';

      if (h === 11) label = '11:00 AM (Pagi / Morning)';
      else if (h === 12) label = '12:00 PM (Siang / Noon)';
      else if (h < 15) label = `${h - 12}:00 PM (Siang / Afternoon)`;
      else if (h < 18) label = `${h - 12}:00 PM (Sore / Late Afternoon)`;
      else if (h === 22) label = '10:00 PM (Tutup / Closing)';
      else label = `${h - 12}:00 PM (Malam / Evening)`;

      hours.push({ value: val, label });
    }
    return hours;
  };

  const hourOptions = getHourOptions(selectedDate);
  const isMonday = selectedDate && new Date(selectedDate).getDay() === 1;

  const handleAddReservation = async (e) => {
    e.preventDefault();

    if (isMonday) {
      alert('Maaf, Ebony Cafe tutup pada hari Senin.');
      return;
    }

    if (!selectedHour) {
      alert('Pilih jam reservasi terlebih dahulu.');
      return;
    }

    setFormLoading(true);
    const fd = new FormData(e.target);

    // Gabungkan Jam dan Menit ke format HH:mm
    const fullTime = `${selectedHour}:${selectedMinute}`;

    const data = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email') || `guest-${Date.now()}@ebony.com`,
      date: selectedDate,
      time: fullTime,
      party_size: parseInt(fd.get('party_size')) || 2,
      occasion: fd.get('occasion') || null,
      dietary_notes: fd.get('notes') || null,
    };

    try {
      await createReservation(data);
      handleCloseModal();
      fetchReservations();
      alert('Reservasi berhasil ditambahkan!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan reservasi.');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const st = (status || 'pending').toLowerCase();
    switch (st) {
      case 'confirmed':
        return <span style={{ background: '#e6f4ea', color: '#137333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>CONFIRMED</span>;
      case 'seated':
        return <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>SEATED</span>;
      case 'completed':
        return <span style={{ background: '#f1f3f4', color: '#5f6368', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>COMPLETED</span>;
      case 'cancelled':
        return <span style={{ background: '#fce8e6', color: '#c5221f', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>CANCELLED</span>;
      default:
        return <span style={{ background: '#fef7e0', color: '#b06000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>PENDING</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <span className="page-label">MANAGEMENT</span>
          <h1 className="page-title page-title--italic">Reservations</h1>
          <p className="page-subtitle">
            Manage upcoming bookings, review guest details, and maintain the serene flow of the gallery cafe.
          </p>
        </div>
        <button className="btn btn--outline-dark" onClick={handleOpenModal}>
          + ADD NEW RESERVATION
        </button>
      </div>

      <hr className="divider divider--section" style={{ marginBottom: 40 }} />

      <div className="list-header">
        <h2 className="list-title">All Upcoming Reservations</h2>
        <button className="btn btn--outline-dark btn--sm" onClick={exportReservationsCSV}>
          ↓ EXPORT CSV
        </button>
      </div>

      <div className="reservation-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reservations.length > 0 ? (
          reservations.map(r => (
            <div 
              key={r.id} 
              onClick={() => navigate(`/admin/reservations/${r.id}`)}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1fr 0.5fr', 
                alignItems: 'center',
                backgroundColor: '#ffffff',
                padding: '20px 24px',
                borderRadius: '8px',
                border: '1px solid #eaeaea',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#a08c5b', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>
                  DATE & TIME
                </span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', fontWeight: 500 }}>
                  {r.formatted_date || r.date}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a1a1a' }}>
                  {r.time}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#a08c5b', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>
                  GUEST
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', display: 'block' }}>
                  {r.guest_name || r.name}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#777' }}>
                  {r.phone}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#a08c5b', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>
                  PARTY
                </span>
                <span style={{ fontSize: '0.9rem', color: '#4a4a4a', fontWeight: 500 }}>
                  👥 {r.party_size} Guests
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#a08c5b', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>
                  TABLE
                </span>
                <span style={{ fontSize: '0.9rem', color: '#4a4a4a', fontWeight: 500 }}>
                  🪑 {r.table_name || 'Unassigned'}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#a08c5b', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>
                  STATUS
                </span>
                {getStatusBadge(r.status)}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a1a1a' }}>
                  DETAIL →
                </span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--color-muted)', padding: '24px 0' }}>Belum ada reservasi.</p>
        )}
      </div>

      <div className="pagination">
        <span className="pagination__info">
          SHOWING {reservations.length} OF {total} RESERVATIONS
        </span>
        <div className="pagination__controls">
          <button 
            className="btn btn--link"
            style={{ color: 'var(--color-muted)', fontWeight: 400 }}
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}>
            ← Previous
          </button>
          <button 
            className="btn btn--link"
            disabled={page >= lastPage}
            onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      </div>

      {showModal && (
        <Modal title="Add New Reservation" onClose={handleCloseModal}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="reservation-form" onSubmit={handleAddReservation}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Guest Name *</label>
                  <input type="text" name="name" className="form-input" placeholder="Enter guest name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" name="phone" className="form-input" placeholder="+62..." required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" placeholder="email@domain.com" />
              </div>

              {/* Tanggal & Dropdown Jam + Menit Terpisah */}
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input 
                    type="date" 
                    name="date" 
                    className="form-input" 
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedHour('');
                      setSelectedMinute('00');
                    }}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {/* Dropdown Jam */}
                    <select
                      className="form-input"
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      disabled={!selectedDate || isMonday}
                      required
                      style={{ flex: 2 }}
                    >
                      <option value="">
                        {!selectedDate 
                          ? '-- Select Date First --' 
                          : isMonday 
                            ? '-- Closed Monday --' 
                            : '-- Select Hour --'
                        }
                      </option>
                      {hourOptions.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>

                    {/* Dropdown Menit */}
                    <select
                      className="form-input"
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      disabled={!selectedHour}
                      style={{ flex: 1 }}
                    >
                      <option value="00">:00</option>
                      <option value="15">:15</option>
                      <option value="30">:30</option>
                      <option value="45">:45</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Party Size *</label>
                  <input type="number" name="party_size" className="form-input" min="1" max="100" placeholder="e.g. 2" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Occasion</label>
                  <select name="occasion" className="form-input">
                    <option value="">None</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Business Dinner">Business Dinner</option>
                    <option value="Date Night">Date Night</option>
                    <option value="Family Gathering">Family Gathering</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Special Notes (Dietary / Seating)</label>
                <textarea name="notes" className="form-input form-textarea" rows="3" placeholder="Any special requests..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--outline-dark" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Reservation'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}