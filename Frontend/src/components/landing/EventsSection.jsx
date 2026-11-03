import { useState, useEffect } from 'react';
import { getEvents } from '../../api/publicApi';
import EventCard from './EventCard';
import AOS from 'aos';

const getDefaultEvents = () => {
  const now = new Date();
  const makeDate = (daysAhead, hour, minute = 0) => {
    const d = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'evt-1',
      title: 'Wine & Dine Night: Bordeaux Vintage',
      description: 'An exclusive 5-course curated dinner paired with premier grand cru wines selected by our master sommelier.',
      date: makeDate(7, 19, 0),
      has_time: true,
      image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      is_active: true,
    },
    {
      id: 'evt-2',
      title: 'Acoustic Jazz Evening under the Stars',
      description: 'Intimate live jazz performance featuring Jakarta Jazz Quartet, outdoor cocktail specials, and tasting platters.',
      date: makeDate(14, 20, 0),
      has_time: true,
      image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      is_active: true,
    },
    {
      id: 'evt-3',
      title: 'French Pastry & Culinary Masterclass',
      description: 'Hands-on session with Executive Chef Jean-Paul on the art of French pastry dough, croissants, and ganache.',
      date: makeDate(21, 10, 0),
      has_time: true,
      image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      is_active: true,
    },
  ];
};

export default function EventsSection() {
  const [events, setEvents] = useState(getDefaultEvents);

  useEffect(() => {
    getEvents()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
        } else if (Array.isArray(data) && data.length === 0) {
          // Jika server database aktif tapi event memang belum diinput admin
          setEvents([]);
        }
      })
      .catch(() => {
        // Jika server backend/koneksi belum siap (misal saat cek project sebelum koding),
        // fallback elegan tetap aktif dan tidak memunculkan error mengganggu
        setEvents(getDefaultEvents());
      });
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      AOS.refresh();
    }
  }, [events]);

  return (
    <section className="events" id="events">
      <div className="section-header" data-aos="fade-up">
        <span className="section-label">WHAT'S ON</span>
        <h2 className="section-title">Upcoming Events</h2>
      </div>

      <div className="events__grid">
        {events.map((event, index) => (
          <div key={event.id} className="events__grid-item" data-aos="fade-up" data-aos-delay={index * 100}>
            <EventCard event={event} />
          </div>
        ))}
      </div>
      {events.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginTop: '12px' }}>
          Belum ada event mendatang. Pantau terus info terbaru dari kami!
        </p>
      )}
    </section>
  );
}
