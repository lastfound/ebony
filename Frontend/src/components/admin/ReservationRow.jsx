import { useNavigate } from 'react-router-dom';

export default function ReservationRow({ reservation }) {
  const navigate = useNavigate();
  
  // Pisahkan jam dan menit dengan aman
  let timeStr = reservation.time || '12:00';
  let isPM = false;
  let displayHour = '12';
  let minute = '00';
  
  // Format waktu sederhana jika format HH:MM
  if (timeStr.includes(':')) {
    const [h, m] = timeStr.split(':');
    const hourNum = parseInt(h);
    isPM = hourNum >= 12;
    displayHour = hourNum > 12 ? (hourNum - 12).toString().padStart(2, '0') : (hourNum === 0 ? '12' : hourNum.toString().padStart(2, '0'));
    minute = m;
  } else if (timeStr.toLowerCase().includes('pm')) {
    isPM = true;
    const cleanTime = timeStr.replace(/PM|AM|pm|am|\s/g, '');
    const [h, m] = cleanTime.includes(':') ? cleanTime.split(':') : [cleanTime, '00'];
    displayHour = h.padStart(2, '0');
    minute = m;
  }

  return (
    <div className="reservation-row">
      <div className="reservation-row__time">
        <span className="row-label">TIME</span>
        <span className="row-value row-value--time">
          {displayHour}:{minute} <small>{isPM ? 'PM' : 'AM'}</small>
        </span>
      </div>
      <div className="reservation-row__guest">
        <span className="row-label">GUEST</span>
        <span className="row-value" style={{ fontWeight: 600 }}>{reservation.guest_name}</span>
      </div>
      <div className="reservation-row__party">
        <span className="row-label">PARTY</span>
        <span className="row-value" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)' }}>
          👥 {reservation.party_size} Guests
        </span>
      </div>
      <div className="reservation-row__table">
        <span className="row-label">TABLE</span>
        <span className="row-value" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)' }}>
          🪑 {reservation.table_name}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <button
          className="btn btn--link"
          style={{ fontStyle: 'italic' }}
          onClick={() => navigate(`/admin/reservations/${reservation.id}`)}>
          Detail
        </button>
      </div>
    </div>
  );
}
