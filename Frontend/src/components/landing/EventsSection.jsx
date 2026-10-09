import { useState, useEffect } from 'react';
import { getEvents } from '../../api/publicApi';
import EventCard from './EventCard';
import AOS from 'aos';

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    getEvents()
      .then((data) => {
        // Tampilkan HANYA data asli dari database.
        // (Dulu ada data contoh khayalan yang foto & isinya tidak sesuai
        //  input admin — sudah dibuang supaya tidak menipu pengunjung.)
        setEvents(Array.isArray(data) ? data : []);
        setLoadFailed(false);
      })
      .catch(() => {
        setEvents([]);
        setLoadFailed(true);
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
          {loadFailed
            ? 'Gagal memuat event. Periksa koneksi ke server lalu muat ulang halaman.'
            : 'Belum ada event mendatang. Pantau terus info terbaru dari kami!'}
        </p>
      )}
    </section>
  );
}
