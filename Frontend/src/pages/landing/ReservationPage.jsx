import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { submitReservation } from '../../api/publicApi';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/landing/Navbar';

const INITIAL = {
  name: '',
  phone: '',
  email: '',
  date: '',
  time: '',
  party_size: 2,
  occasion: '',
  table_id: '',
  dietary_notes: '',
  seating_notes: '',
};

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Business Dinner',
  'Date Night', 'Family Gathering', 'Other',
];

function FormField({ label, error, required, ...props }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="form-required">*</span>}
      </label>
      <input className={`form-input ${error ? 'is-error' : ''}`} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default function ReservationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const eventTitle = location.state?.eventTitle;

  const [form, setForm] = useState({
    ...INITIAL,
    occasion: eventTitle ? `Event: ${eventTitle}` : '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingNo, setBookingNo] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Nama minimal 2 karakter';
    if (!form.phone || form.phone.length < 8) errs.phone = 'Nomor telepon tidak valid';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.date) errs.date = 'Pilih tanggal reservasi';
    if (!form.time) errs.time = 'Pilih jam reservasi';
    if (form.party_size < 1 || form.party_size > 20) errs.party_size = 'Jumlah tamu 1–20 orang';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);

    // --- SIMULASI PENUH (Untuk Demo UI) ---
    // Jika jumlah tamu > 15, kita simulasikan bahwa reservasi ditolak karena full
    if (parseInt(form.party_size) > 15) {
      setTimeout(() => {
        setErrors({ general: 'Maaf, kuota reservasi pada tanggal/jam tersebut sudah full. Silakan pilih waktu lain.' });
        setLoading(false);
      }, 800);
      return;
    }
    // --------------------------------------

    try {
      const res = await submitReservation(form);
      setBookingNo(res.booking_number || res.data?.booking_number || 'EBONY-001');
      setSuccess(true);
    } catch (error) {
      // Tangkap pesan error spesifik dari Backend Laravel nanti
      const errMsg = error.response?.data?.message || 'Terjadi kesalahan sistem atau kuota penuh. Coba lagi.';
      setErrors({ general: errMsg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="reservation-success">
          <div style={{ fontSize: 48 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36 }}>
            Reservasi Berhasil!
          </h2>
          <p>
            Nomor booking Anda: <strong style={{ color: 'var(--color-accent-dk)' }}>#{bookingNo}</strong>
          </p>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            Kami akan menghubungi Anda melalui nomor telepon atau email yang didaftarkan.
          </p>
          <button className="btn btn--primary" onClick={() => navigate('/')}>
            Kembali ke Beranda
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="reservation-page">
        <div className="reservation-page__inner">
          <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← BACK TO HOME
          </Link>
          <h1 className="reservation-page__title">Reserve a Table</h1>
          <p className="reservation-page__subtitle">
            Isi form di bawah untuk melakukan reservasi di Ebony Cafe &amp; Gallery.
          </p>

          {errors.general && (
            <div className="alert alert--error" style={{ marginBottom: 20 }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reservation-form" noValidate>
            {/* Baris 1: Nama + Telepon */}
            <div className="form-row">
              <FormField
                label="Nama Lengkap"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Masukkan nama lengkap"
                required
              />
              <FormField
                label="Nomor Telepon"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+62..."
                required
              />
            </div>

            {/* Email */}
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="email@domain.com"
              required
            />

            {/* Tanggal + Jam */}
            <div className="form-row">
              <FormField
                label="Tanggal Reservasi"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                error={errors.date}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <FormField
                label="Jam Reservasi"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                error={errors.time}
                min="11:00"
                max="21:00"
                required
              />
            </div>

            {/* Jumlah Tamu + Occasion */}
            <div className="form-row">
              <FormField
                label="Jumlah Tamu"
                name="party_size"
                type="number"
                value={form.party_size}
                onChange={handleChange}
                error={errors.party_size}
                min={1}
                max={20}
                required
              />
              <div className="form-group">
                <label className="form-label">
                  {eventTitle ? 'Special Event' : 'Occasion'} <span>(Opsional)</span>
                </label>
                {eventTitle ? (
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--color-sidebar)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    height: '46px'
                  }}>
                    🎟 {eventTitle}
                  </div>
                ) : (
                  <select
                    name="occasion"
                    value={form.occasion}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">-- Pilih Occasion --</option>
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Catatan Dietary */}
            <div className="form-group">
              <label className="form-label">
                Catatan Dietary <span>(Opsional)</span>
              </label>
              <textarea
                name="dietary_notes"
                value={form.dietary_notes}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Alergi makanan, pantangan, dll."
                rows={3}
              />
            </div>

            {/* Preferensi Tempat Duduk */}
            <div className="form-group">
              <label className="form-label">
                Preferensi Tempat Duduk <span>(Opsional)</span>
              </label>
              <textarea
                name="seating_notes"
                value={form.seating_notes}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Contoh: kursi dekat jendela, area yang tenang, dll."
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'SUBMIT RESERVASI'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
