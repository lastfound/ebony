import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="event-card">
      <div className="event-card__image">
        <img
          src={event.image_url}
          alt={event.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';
          }}
        />
        <span className="event-card__tag">UPCOMING</span>
      </div>
      <div className="event-card__body">
        <span className="event-card__date">{formattedDate.toUpperCase()}</span>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__desc">{event.description}</p>
        <Link to={`/events/${event.id}`} className="btn btn--link">VIEW DETAILS →</Link>
      </div>
    </div>
  );
}
