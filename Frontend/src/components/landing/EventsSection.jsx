import { useState, useEffect } from 'react';
import { getEvents } from '../../api/publicApi';
import EventCard from './EventCard';

const SAMPLE_EVENTS = [
  {
    id: 1,
    title: 'Wine & Dine Night',
    description: 'An exclusive wine pairing dinner featuring premium small-batch and curated pours.',
    date: '2026-10-12T19:00:00',
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80',
  },
  {
    id: 2,
    title: "Chef's Table Experience",
    description: 'Join our head chef for an intimate dinner with behind-the-scenes stories and tastings.',
    date: '2026-10-19T19:30:00',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  },
  {
    id: 3,
    title: 'Live Jazz Evening',
    description: 'Enjoy live jazz with artisan-crafted cocktails and small plates in the lounge area.',
    date: '2026-10-25T20:00:00',
    image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80',
  },
];

export default function EventsSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents()
      .then((data) => {
        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(SAMPLE_EVENTS);
        }
      })
      .catch(() => setEvents(SAMPLE_EVENTS));
  }, []);

  return (
    <section className="events" id="events">
      <div style={{ textAlign: 'center', marginBottom: 48 }} data-aos="fade-up">
        <span className="about__label">WHAT'S ON</span>
        <h2 className="about__title" style={{ marginBottom: 0 }}>Upcoming Events</h2>
      </div>

      <div className="events__grid">
        {events.map((event, index) => (
          <div key={event.id} data-aos="fade-up" data-aos-delay={index * 100}>
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}
