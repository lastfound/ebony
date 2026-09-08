import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const SAMPLE_DETAIL = {
  id: 1,
  booking_number: "8291",
  date: "Oct 24, 2026",
  time: "7:30 PM",
  party_size: 4,
  table_name: "Table 12",
  table_area: "Window",
  occasion: "Anniversary",
  is_arrived: false,
  dietary_notes: "One guest has a severe shellfish allergy. Please ensure cross-contamination protocols are followed.",
  seating_notes: "Would strongly prefer a quiet corner table or a window seat facing the gallery side if possible.",
  guest: {
    name: "Eleanor Vance",
    phone: "+62 XXXX XXXX",
    email: "e.vance@example.com",
    is_vip: true,
    avatar: null
  },
  preorders: [
    {
      id: 1,
      name: "Choco Crunchy Toast",
      description: "Toast dengan toping coklat yang bertekstur renyah di padu dengan eskrim vanila",
      price: 30000,
      qty: 2,
      image_url: "https://images.unsplash.com/photo-1548849506-68fb767df56c?w=150&q=80"
    },
    {
      id: 2,
      name: "Maranggi Satay",
      description: "Sate daging sapi dengan bumbu rempah yang manis dan gurih",
      price: 75000,
      qty: 1,
      image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&q=80"
    },
    {
      id: 3,
      name: "Churos",
      description: "Snack manis khas Portugis dengan saus celup coklat",
      price: 35000,
      qty: 1,
      image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=150&q=80"
    }
  ]
};

export default function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [arrived, setArrived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setData(SAMPLE_DETAIL);
      setArrived(SAMPLE_DETAIL.is_arrived);
      setLoading(false);
    }, 400);
  }, [id]);

  const handleConfirmArrival = () => {
    // API logic here
    setArrived(true);
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;

  const subtotal = data.preorders.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.25;
  const total = subtotal + tax;

  return (
    <AdminLayout>
      <button className="back-link" onClick={() => navigate('/admin/reservations')}>
        ← Back to Reservations
      </button>

      <div className="detail-header">
        <div>
          <h1 className="page-title">
            Reservation Detail <span className="detail-number">#{data.booking_number}</span>
          </h1>
          <p className="page-subtitle">
            Review guest details, special requests, and pre-ordered menu items for the upcoming seating.
          </p>
        </div>
        <div className="detail-header__actions">
          <button className="btn btn--outline-dark" onClick={() => setShowEditModal(true)}>Edit Booking</button>
          <button 
            className="btn btn--primary" 
            onClick={handleConfirmArrival}
            disabled={arrived}>
            {arrived ? 'Arrived ✓' : 'Confirm Arrival'}
          </button>
        </div>
      </div>

      <div className="detail-body">
        {/* Panel Kiri */}
        <div className="detail-panel detail-panel--left">
          
          <div className="detail-card">
            <div className="detail-card__header">
              <span>👤 Guest Information</span>
            </div>
            <div className="guest-info">
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: 'var(--color-muted)'
              }}>
                {data.guest.name.charAt(0)}
              </div>
              <div>
                <h3 style={{fontFamily: 'var(--font-serif)', fontSize: 24}}>{data.guest.name}</h3>
                {data.guest.is_vip && <Badge variant="vip">VIP MEMBER</Badge>}
              </div>
            </div>
            <div className="guest-contacts">
              <p><span className="label">Phone</span> {data.guest.phone}</p>
              <p><span className="label">Email</span> {data.guest.email}</p>
            </div>
          </div>

          <a href="/" target="_blank" rel="noreferrer" className="btn btn--outline-dark btn--full" style={{ padding: '14px' }}>
            View Live Site
          </a>

          <div className="detail-card">
            <div className="detail-card__header">📅 Booking Details</div>
            <div className="booking-grid">
              <div>
                <span className="label">Date & Time</span>
                <span className="booking-date">{data.date}</span>
                <span className="booking-time">{data.time}</span>
              </div>
              <div>
                <span className="label">Party Size</span>
                <span style={{ fontSize: 18, fontFamily: 'var(--font-serif)' }}>{data.party_size} Guests</span>
              </div>
              <div>
                <span className="label">Table Assignment</span>
                <span style={{ fontSize: 18, fontFamily: 'var(--font-serif)' }}>{data.table_name}</span>
                <small style={{ color: 'var(--color-muted)', fontSize: 12 }}>({data.table_area})</small>
              </div>
              <div>
                <span className="label">Occasion</span>
                <span style={{ fontSize: 18, fontFamily: 'var(--font-serif)' }}>{data.occasion || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Kanan */}
        <div className="detail-panel detail-panel--right">
          
          <div className="preorder-section">
            <div className="preorder-section__header">
              <h2>Pre-Order Summary</h2>
              <Badge variant="confirmed">Confirmed</Badge>
            </div>

            {data.preorders.map(item => (
              <div className="preorder-item" key={item.id}>
                <img src={item.image_url} alt={item.name} />
                <div className="preorder-item__info">
                  <span className="name">{item.name}</span>
                  <span className="desc">{item.description}</span>
                </div>
                <div className="preorder-item__price-qty">
                  <span className="price">Rp {item.price.toLocaleString('id-ID')}</span>
                  <span className="qty">Qty {item.qty}</span>
                </div>
              </div>
            ))}

            <div className="preorder-summary">
              <div className="preorder-summary__row">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="preorder-summary__row">
                <span>Estimated Tax & Gratuity (25%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="preorder-summary__row preorder-summary__row--total">
                <span>Estimated Total</span>
                <span className="total-value">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {(data.dietary_notes || data.seating_notes) && (
            <div className="special-notes">
              <div className="special-notes__header">📋 Special Notes & Requests</div>
              {data.dietary_notes && (
                <div className="special-notes__item">
                  <span className="tag">DIETARY</span>
                  <p>"{data.dietary_notes}"</p>
                </div>
              )}
              {data.seating_notes && (
                <div className="special-notes__item">
                  <span className="tag">SEATING</span>
                  <p>"{data.seating_notes}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <Modal title="Edit Reservation" onClose={() => setShowEditModal(false)}>
          <div style={{ padding: '10px 0 20px', textAlign: 'left' }}>
            <form className="reservation-form" onSubmit={(e) => { e.preventDefault(); setShowEditModal(false); }}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Guest Name *</label>
                  <input type="text" className="form-input" defaultValue={data.guest.name} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" className="form-input" defaultValue={data.guest.phone} required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="text" className="form-input" defaultValue={data.date} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input type="text" className="form-input" defaultValue={data.time} required />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Party Size *</label>
                  <input type="number" className="form-input" min="1" max="20" defaultValue={data.party_size} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Table Assignment</label>
                  <select className="form-input" defaultValue={data.table_name}>
                    <option value="">-- Assign Table --</option>
                    <option value="Table 12">Table 12</option>
                    <option value="Table 14">Table 14</option>
                    <option value="Private A">Private A</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Occasion</label>
                  <select className="form-input" defaultValue={data.occasion}>
                    <option value="">None</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Special Notes</label>
                <textarea className="form-input form-textarea" rows="3" defaultValue={data.seating_notes || data.dietary_notes}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--outline-dark" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Save Changes</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
