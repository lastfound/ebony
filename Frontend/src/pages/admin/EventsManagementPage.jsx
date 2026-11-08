import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import EventAdminCard from '../../components/admin/EventAdminCard';
import Modal from '../../components/ui/Modal';
import { getAdminEvents, createEvent, updateEvent, deleteEvent } from '../../api/adminApi';

export default function EventsManagementPage() {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchEvents = () => {
    getAdminEvents()
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Yakin ingin menghapus event ini?')) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('Gagal menghapus event.');
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const fd = new FormData(e.target);

    const dateVal = fd.get('date');
    const timeVal = fd.get('time');
    const hasTime = !!timeVal;
    if (dateVal && timeVal) {
      fd.set('date', `${dateVal}T${timeVal}`);
    } else if (dateVal) {
      // Acara tanpa jam pasti — jam dibebaskan saat reservasi
      fd.set('date', `${dateVal}T00:00`);
    }
    fd.set('has_time', hasTime ? '1' : '0');
    fd.delete('time');
    // end_date dikirim langsung sebagai datetime-local (boleh kosong)
    if (!fd.get('end_date')) fd.set('end_date', '');

    try {
      if (editItem) {
        await updateEvent(editItem.id, fd);
      } else {
        await createEvent(fd);
      }
      setShowEventModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan event.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <span className="page-label">EXPERIENCE</span>
          <h1 className="page-title">Events Management</h1>
          <p className="page-subtitle">Jadwalkan dining experiences, workshop, dan acara spesial Ebony Cafe.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => {
            setEditItem(null);
            setShowEventModal(true);
          }}
        >
          + Add Event
        </button>
      </div>

      <div className="menu-admin-grid">
        {events.map((event) => (
          <EventAdminCard
            key={event.id}
            event={event}
            onEdit={() => {
              setEditItem(event);
              setShowEventModal(true);
            }}
            onDelete={() => handleDeleteEvent(event.id)}
          />
        ))}
        {events.length === 0 && (
          <p style={{ color: 'var(--color-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
            Belum ada event yang dijadwalkan. Klik "+ Add Event" untuk membuat acara baru.
          </p>
        )}
      </div>

      {/* Modal Event */}
      {showEventModal && (
        <Modal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          title={editItem ? 'Edit Special Event' : 'Create Special Event'}
        >
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <form onSubmit={handleEventSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  defaultValue={editItem?.title || ''}
                  placeholder="e.g. Wine & Dine Night"
                  required
                />
              </div>

              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    name="date"
                    className="form-input"
                    defaultValue={editItem?.date ? editItem.date.split('T')[0] : ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Time <span style={{ fontWeight: 400 }}>(kosongkan jika tanpa jam pasti)</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    className="form-input"
                    defaultValue={
                      editItem?.has_time === false
                        ? ''
                        : editItem?.date
                        ? editItem.date.split('T')[1]?.substring(0, 5)
                        : ''
                    }
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">
                  Selesai <span style={{ fontWeight: 400 }}>(opsional — batas jam reservasi)</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  className="form-input"
                  defaultValue={editItem?.end_date ? String(editItem.end_date).substring(0, 16) : ''}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-input"
                  style={{ height: '70px', resize: 'none' }}
                  defaultValue={editItem?.description || ''}
                  placeholder="Describe event details..."
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">
                  Event Banner {editItem ? '(Leave blank to keep current)' : '*'}
                </label>
                <input type="file" name="image" className="form-input" accept="image/*" required={!editItem} />
              </div>

              <div
                className="form-actions"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '16px',
                }}
              >
                <button
                  type="button"
                  className="btn btn--outline-dark"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editItem ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
