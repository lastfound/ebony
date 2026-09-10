import { useNavigate } from 'react-router-dom';

export default function ReservationRow({ reservation }) {
  const navigate = useNavigate();

  return (
    <div 
      className="reservation-card"
      onClick={() => navigate(`/admin/reservations/${reservation.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Kolom Tanggal & Jam */}
      <div className="reservation-col">
        <span className="reservation-label">DATE & TIME</span>
        <div className="reservation-time-group" style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500, lineHeight: 1.2 }}>
            {reservation.formatted_date || reservation.date}
          </span>
          <span className="reservation-time" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {reservation.time}
          </span>
        </div>
      </div>

      {/* Kolom Guest */}
      <div className="reservation-col">
        <span className="reservation-label">GUEST</span>
        <div className="reservation-guest-name">{reservation.guest_name}</div>
      </div>

      {/* Kolom Party */}
      <div className="reservation-col">
        <span className="reservation-label">PARTY</span>
        <div className="reservation-party">
          <span className="party-icon">👥</span> {reservation.party_size} Guests
        </div>
      </div>

      {/* Kolom Table */}
      <div className="reservation-col">
        <span className="reservation-label">TABLE</span>
        <div className="reservation-table">
          <span className="table-icon">🪑</span> {reservation.table_name || 'Unassigned'}
        </div>
      </div>

      {/* Tombol Detail */}
      <div className="reservation-col reservation-col--action" style={{ textAlign: 'right' }}>
        <span className="btn-detail" style={{ fontSize: '0.85rem', fontWeight: 600, fontStyle: 'italic' }}>
          DETAIL
        </span>
      </div>
    </div>
  );
}