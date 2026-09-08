export default function EventAdminCard({ event, onEdit, onDelete }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="event-admin-card">
      <div className="event-admin-card__img">
        <img src={event.image_url} alt={event.title} />
      </div>
      <div className="event-admin-card__body">
        <span className="event-admin-card__date">{formattedDate}</span>
        <h3 className="event-admin-card__title">{event.title}</h3>
        <p className="event-admin-card__desc">{event.description}</p>
        
        <div className="event-admin-card__actions" style={{ justifyContent: 'space-between' }}>
          <button className="btn--edit" onClick={onEdit}>EDIT EVENT</button>
          <button className="btn--delete-icon" onClick={onDelete} title="Delete Event">
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
