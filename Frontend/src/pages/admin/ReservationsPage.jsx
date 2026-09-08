import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ReservationRow from '../../components/admin/ReservationRow';
import Modal from '../../components/ui/Modal';
// import { getReservations, exportReservationsCSV } from '../../api/adminApi';

const SAMPLE_RESERVATIONS = [
  { id: 1, booking_number: '8291', guest_name: 'Eleanor Vance', time: '11:30 AM', party_size: 2, table_name: 'Window 04' },
  { id: 2, booking_number: '8292', guest_name: 'Julian Crane', time: '12:00 PM', party_size: 4, table_name: 'Gallery Central' },
  { id: 3, booking_number: '8293', guest_name: 'The Harrison Grp', time: '02:30 PM', party_size: 8, table_name: 'Private Room A' }
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const PER_PAGE = 4;

  useEffect(() => {
    // In a real app: getReservations({ page, per_page: PER_PAGE }).then(...)
    setReservations(SAMPLE_RESERVATIONS);
    setTotal(12);
  }, [page]);

  const exportReservationsCSV = () => {
    alert("Downloading CSV...");
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
        {reservations.map(r => (
          <ReservationRow key={r.id} reservation={r} />
        ))}
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
            disabled={page * PER_PAGE >= total}
            onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      </div>

      {showModal && (
        <Modal title="Add New Reservation" onClose={() => setShowModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="reservation-form" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Guest Name *</label>
                  <input type="text" className="form-input" placeholder="Enter guest name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" className="form-input" placeholder="+62..." required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input type="time" className="form-input" required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Party Size *</label>
                  <input type="number" className="form-input" min="1" max="20" placeholder="e.g. 2" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Table Assignment</label>
                  <select className="form-input">
                    <option value="">-- Assign Table --</option>
                    <option value="window-01">Window 01</option>
                    <option value="gallery-04">Gallery 04</option>
                    <option value="private-a">Private Room A</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Occasion</label>
                  <select className="form-input">
                    <option value="">None</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Special Notes (Dietary / Seating)</label>
                <textarea className="form-input form-textarea" rows="3" placeholder="Any special requests..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Save Reservation</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
