import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ReservationRow from '../../components/admin/ReservationRow';
import Modal from '../../components/ui/Modal';
import { getReservations, exportReservationsCSV, createReservation } from '../../api/adminApi';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const PER_PAGE = 4;

  const fetchReservations = () => {
    getReservations({ page, per_page: PER_PAGE })
      .then(res => {
        setReservations(res.data || []);
        setTotal(res.total || 0);
        setLastPage(res.last_page || 1);
      })
      .catch(() => setReservations([]));
  };

  useEffect(() => {
    fetchReservations();
  }, [page]);

  const handleAddReservation = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email') || `guest-${Date.now()}@ebony.com`,
      date: fd.get('date'),
      time: fd.get('time'),
      party_size: parseInt(fd.get('party_size')) || 2,
      occasion: fd.get('occasion') || null,
      dietary_notes: fd.get('notes') || null,
    };

    try {
      await createReservation(data);
      setShowModal(false);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan reservasi.');
    } finally {
      setFormLoading(false);
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
        <button className="btn btn--outline-dark" onClick={() => setShowModal(true)}>
          + ADD NEW RESERVATION
        </button>
      </div>

      <hr className="divider divider--section" style={{ marginBottom: 40 }} />

      <div className="list-header">
        <h2 className="list-title">Upcoming Today</h2>
        <button className="btn btn--outline-dark btn--sm" onClick={exportReservationsCSV}>
          ↓ EXPORT CSV
        </button>
      </div>

      <div className="reservation-list">
        {reservations.length > 0 ? (
          reservations.map(r => (
            <ReservationRow key={r.id} reservation={r} />
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
        <Modal title="Add New Reservation" onClose={() => setShowModal(false)}>
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

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" name="date" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input type="time" name="time" className="form-input" required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Party Size *</label>
                  <input type="number" name="party_size" className="form-input" min="1" max="20" placeholder="e.g. 2" required />
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
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowModal(false)}>Cancel</button>
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
