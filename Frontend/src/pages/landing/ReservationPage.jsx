import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { submitReservation, getAvailableTables } from '../../api/publicApi';
import Spinner from '../../components/ui/Spinner';
import TableMap from '../../components/TableMap';
import Navbar from '../../components/landing/Navbar';

const INITIAL = {
  name: '',
  phone: '',
  email: '',
  date: '',
  selectedHour: '',
  selectedMinute: '00',
  party_size: 2,
  occasion: '',
  customOccasion: '',
  table_id: '',
  dietary_notes: '',
  seating_notes: '',
};

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Business Dinner',
  'Date Night', 'Family Gathering', 'Other',
];

function FormField({ label, error, required, children, ...props }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="form-required">*</span>}
      </label>
      {children || <input className={`form-input ${error ? 'is-error' : ''}`} {...props} />}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default function ReservationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Info event diteruskan dari halaman detail event (tanggal & jam dibaca
  // sebagai teks mentah YYYY-MM-DDTHH:MM agar tidak geser zona waktu).
  const eventState = location.state || {};
  const eventTitle = eventState.eventTitle;
  const eventDateStr = eventState.eventDate ? String(eventState.eventDate).substring(0, 10) : '';
  const eventTimeStr = eventState.eventDate ? String(eventState.eventDate).substring(11, 16) : '';
  const eventEndStr = eventState.eventEndDate ? String(eventState.eventEndDate).substring(11, 16) : '';
  // Jam dikunci hanya jika event punya jam pasti (bukan 00:00).
  const eventTimeLocked = Boolean(eventTitle && eventDateStr && eventState.eventHasTime !== false && eventTimeStr && eventTimeStr !== '00:00');
  const eventHour = eventTimeLocked ? eventTimeStr.substring(0, 2) : '';
  const eventMinute = eventTimeLocked ? eventTimeStr.substring(3, 5) : '00';

  const [form, setForm] = useState({
    ...INITIAL,
    date: eventDateStr || '',
    selectedHour: eventHour || '',
    selectedMinute: eventMinute || '00',
    occasion: eventTitle ? `Event: ${eventTitle}` : '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingNo, setBookingNo] = useState(null);
  const [selectedTableName, setSelectedTableName] = useState('');

  // Denah meja: hanya yang kosong yang bisa dipilih
  const [tables, setTables] = useState([]);
  const [tablesMeta, setTablesMeta] = useState(null);
  const [fetchedSlotKey, setFetchedSlotKey] = useState('');

  // Menentukan jam yang valid berdasarkan tanggal yang dipilih
  const getHourOptions = (selectedDate) => {
    if (!selectedDate) return [];
    
    const day = new Date(selectedDate).getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    if (day === 1) return []; // Senin Tutup

    const isWeekend = day === 0 || day === 6;
    const startHour = isWeekend ? 11 : 12; // Weekend 11:00 AM, Weekday 12:00 PM
    const endHour = 22; // Tutup jam 10:00 PM (22:00)

    const hours = [];
    for (let h = startHour; h <= endHour; h++) {
      const val = h.toString().padStart(2, '0');
      let label;

      if (h === 11) label = '11:00 AM (Pagi / Morning)';
      else if (h === 12) label = '12:00 PM (Siang / Noon)';
      else if (h < 15) label = `${h - 12}:00 PM (Siang / Afternoon)`;
      else if (h < 18) label = `${h - 12}:00 PM (Sore / Late Afternoon)`;
      else if (h === 22) label = '10:00 PM (Tutup / Closing)';
      else label = `${h - 12}:00 PM (Malam / Evening)`;

      hours.push({ value: val, label });
    }
    return hours;
  };

  const hourOptions = eventTimeLocked
    ? [{ value: eventHour, label: `${eventTimeStr} (Jam acara)` }]
    : getHourOptions(form.date);
  // Event yang dibuat admin menentukan jadwalnya sendiri (termasuk jika
  // admin sengaja membuka event di hari Senin) — aturan tutup Senin hanya
  // untuk reservasi umum tanpa event.
  const isMonday = !eventDateStr && form.date && new Date(form.date).getDay() === 1;
  const fullTimePreview = form.selectedHour ? `${form.selectedHour}:${form.selectedMinute}` : '';

  // Ambil denah setiap kali slot berubah — user hanya melihat status terbaru.
  // Catatan: tidak ada setState sinkron di dalam effect (aturan react-hooks).
  // Status loading dihitung dari slotKey vs fetchedSlotKey di bawah.
  const slotKey = `${form.date}|${form.selectedHour}|${form.selectedMinute}|${form.party_size}|${isMonday ? 'closed' : 'open'}`;
  const slotValid = Boolean(form.date && form.selectedHour && form.party_size && !isMonday);
  const loadingTables = slotValid && fetchedSlotKey !== slotKey;
  useEffect(() => {
    if (!form.date || !form.selectedHour || !form.party_size || isMonday) return undefined;
    const key = `${form.date}|${form.selectedHour}|${form.selectedMinute}|${form.party_size}|open`;
    let cancelled = false;
    getAvailableTables({
      date: form.date,
      time: `${form.selectedHour}:${form.selectedMinute}`,
      party_size: Number(form.party_size) || 1,
    })
      .then((res) => {
        if (cancelled) return;
        setTables(res.data || []);
        setTablesMeta(res.meta || null);
        setFetchedSlotKey(key);
      })
      .catch(() => {
        if (!cancelled) {
          setTables([]);
          setTablesMeta(null);
          setFetchedSlotKey(key);
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey]);

  const clearTableMap = () => {
    setTables([]);
    setTablesMeta(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tanggal & jam milik event tidak boleh diubah user.
    if (name === 'date' && eventDateStr) return;
    if ((name === 'selectedHour' || name === 'selectedMinute') && eventTimeLocked) return;

    if (name === 'date') {
      setForm((prev) => ({ ...prev, date: value, selectedHour: '', selectedMinute: '00', table_id: '' }));
      clearTableMap();
    } else if (name === 'selectedHour' || name === 'selectedMinute' || name === 'party_size') {
      // Slot berubah = pilihan meja lama tidak berlaku lagi
      setForm((prev) => ({ ...prev, [name]: value, table_id: '' }));
      clearTableMap();
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: '', general: '', table_id: '' }));
  };

  const handleSelectTable = (id) => {
    const found = tables.find((t) => String(t.id) === String(id));
    setForm((prev) => ({ ...prev, table_id: id }));
    setSelectedTableName(found ? `${found.name} (${found.area})` : '');
    setErrors((prev) => ({ ...prev, table_id: '', general: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Nama minimal 2 karakter';
    if (!form.phone || form.phone.length < 8) errs.phone = 'Nomor telepon tidak valid';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.date) errs.date = 'Pilih tanggal reservasi';
    if (isMonday) errs.date = 'Maaf, Ebony Cafe tutup pada hari Senin';
    if (!form.selectedHour) errs.time = 'Pilih jam reservasi';
    if (form.party_size < 1 || form.party_size > 100) errs.party_size = 'Jumlah tamu 1–100 orang';
    if (form.occasion === 'Other' && !form.customOccasion.trim()) {
      errs.occasion = 'Sebutkan jenis acara Anda';
    }
    // Meja wajib dipilih kalau masih ada yang kosong — biar admin langsung tau posisi.
    if (tablesMeta && tablesMeta.available > 0 && !form.table_id) {
      errs.table_id = 'Silakan pilih meja yang masih kosong pada denah di bawah.';
    }
    if (tablesMeta && tablesMeta.available === 0 && tables.length > 0) {
      errs.table_id = 'Semua meja yang muat sudah terisi di jam ini. Ganti jam atau hubungi admin via WhatsApp.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);

    // Gabungkan Hour dan Minute ke format HH:mm untuk dikirim ke Backend API
    const fullTime = `${form.selectedHour}:${form.selectedMinute}`;

    const payload = {
      ...form,
      time: fullTime,
      occasion: form.occasion === 'Other' ? form.customOccasion : form.occasion,
      table_id: form.table_id || null,
    };

    try {
      const res = await submitReservation(payload);
      const chosen = tables.find((t) => String(t.id) === String(form.table_id));
      if (chosen) setSelectedTableName(`${chosen.name} (${chosen.area})`);
      setBookingNo(res.booking_number || res.data?.booking_number || 'EBONY-001');
      setSuccess(true);
    } catch (error) {
      // Kalau meja keburu diambil orang lain (termasuk offline/WA), tampilkan denah terbaru.
      const freshTables = error.response?.data?.available_tables;
      if (freshTables) {
        setTables(freshTables);
        const avail = freshTables.filter((t) => t.is_available).length;
        setTablesMeta((prev) => (prev ? { ...prev, available: avail } : prev));
        setForm((prev) => ({ ...prev, table_id: '' }));
      }
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
        <div className="reservation-success" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: 54, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginBottom: 12 }}>
            Reservasi Berhasil Dikirim!
          </h2>
          <div style={{ background: '#f9f8f6', border: '1px dashed #d4af37', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Kode Booking Anda:</p>
            <strong style={{ fontSize: '1.4rem', color: '#1a1a1a', letterSpacing: '1px' }}>#{bookingNo}</strong>
          </div>
          
          <p style={{ color: '#444', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Terima kasih, <strong>{form.name}</strong>. Permintaan reservasi Anda sedang diproses. Tim Admin Ebony Cafe akan menghubungi Anda melalui WhatsApp (<strong>{form.phone}</strong>) untuk konfirmasi ketersediaan tempat.
            {eventTitle && (
              <><br />Reservasi ini untuk acara <strong>{eventTitle}</strong> pada <strong>{form.date} jam {form.selectedHour}:{form.selectedMinute}</strong>.</>
            )}
            {selectedTableName && (
              <><br />Meja pilihan Anda: <strong>{selectedTableName}</strong> — admin akan menempatkan Anda di meja tersebut bila masih kosong, atau menawarkan meja pengganti bila sudah terisi.</>
            )}
          </p>

          <button 
            className="btn btn--primary btn--full" 
            onClick={() => navigate('/')}
          >
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

          {eventTitle && (
            <div className="alert" style={{ marginBottom: 20, background: '#fdf6e0', border: '1px solid #d4af37', borderRadius: '8px', padding: '12px 16px', fontSize: '0.88rem', lineHeight: 1.6 }}>
              🎟 <strong>Reservasi untuk event: {eventTitle}</strong>
              <br />
              📅 Tanggal mengikuti acara ({eventDateStr})
              {eventTimeLocked ? (
                <> — 🕐 jam mengikuti acara ({eventTimeStr}{eventEndStr ? `, acara sampai jam ${eventEndStr}` : ''}) dan tidak bisa diubah.</>
              ) : (
                <> — acara ini tanpa jam pasti, jadi <strong>jam bebas kamu pilih sendiri</strong>.</>
              )}
            </div>
          )}

          {errors.general && (
            <div className="alert alert--error" style={{ marginBottom: 20 }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reservation-form" noValidate>
            {/* ROW 1: Nama & Phone */}
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
                label="Nomor Telepon (WhatsApp)"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+628..."
                required
              />
            </div>

            {/* ROW 2: Email */}
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

            {/* ROW 3: Tanggal & Dropdown Jam + Menit Terpisah */}
            <div className="form-row">
              <FormField
                label="Tanggal Reservasi"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                error={errors.date}
                min={eventDateStr || new Date().toISOString().split('T')[0]}
                disabled={Boolean(eventDateStr)}
                required
              />

              <FormField label="Jam Reservasi (Time Slot)" error={errors.time} required>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Dropdown Jam & Format AM/PM dengan Keterangan Waktu */}
                  <select
                    name="selectedHour"
                    value={form.selectedHour}
                    onChange={handleChange}
                    className={`form-input ${errors.time ? 'is-error' : ''}`}
                    disabled={!form.date || isMonday || eventTimeLocked}
                    style={{ flex: 2 }}
                  >
                    <option value="">
                      {eventTimeLocked
                        ? `${eventTimeStr} (Jam acara)`
                        : !form.date
                          ? '-- Pilih Tanggal Dahulu --'
                          : isMonday
                            ? '-- Tutup Hari Senin --'
                            : '-- Pilih Jam --'
                      }
                    </option>
                    {hourOptions.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown Menit (Tersedia 00, 15, 30, 45) */}
                  <select
                    name="selectedMinute"
                    value={form.selectedMinute}
                    onChange={handleChange}
                    className="form-input"
                    disabled={!form.selectedHour || eventTimeLocked}
                    style={{ flex: 1 }}
                  >
                    {eventTimeLocked ? (
                      <option value={form.selectedMinute}>:{form.selectedMinute}</option>
                    ) : (
                      <>
                        <option value="00">:00</option>
                        <option value="15">:15</option>
                        <option value="30">:30</option>
                        <option value="45">:45</option>
                      </>
                    )}
                  </select>
                </div>
              </FormField>
            </div>

            {/* Keterangan Tambahan untuk Turis/Pencegahan Kebingungan */}
            <p style={{ fontSize: '11px', color: '#777', marginTop: '-12px', marginBottom: '16px' }}>
              * AM: 00:00 - 11:59 (Pagi/Morning) | PM: 12:00 - 23:59 (Siang-Malam/Afternoon-Night). Time zone: WIB (UTC+7).
            </p>

            {/* ROW 4: Jumlah Tamu & Occasion */}
            <div className="form-row">
              <FormField
                label="Jumlah Tamu"
                name="party_size"
                type="number"
                value={form.party_size}
                onChange={handleChange}
                error={errors.party_size}
                min={1}
                max={100}
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
                  <>
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

                    {form.occasion === 'Other' && (
                      <div style={{ marginTop: '8px' }}>
                        <input
                          type="text"
                          name="customOccasion"
                          value={form.customOccasion}
                          onChange={handleChange}
                          className={`form-input ${errors.occasion ? 'is-error' : ''}`}
                          placeholder="Sebutkan jenis acara Anda..."
                        />
                        {errors.occasion && <span className="form-error">{errors.occasion}</span>}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Pilih Meja — hanya yang kosong yang bisa diklik */}
            <div className="form-group">
              <label className="form-label">
                Pilih Meja <span className="form-required">*</span>
              </label>
              <p style={{ fontSize: '12px', color: '#777', margin: '0 0 10px' }}>
                {fullTimePreview && form.date
                  ? `Denah untuk ${form.date} jam ${fullTimePreview} — hijau kosong bisa dipilih, merah sudah terisi.`
                  : 'Pilih tanggal & jam dulu, denah meja yang masih kosong akan muncul di sini.'}
              </p>
              <TableMap
                tables={tables}
                selectedId={form.table_id}
                onSelect={handleSelectTable}
                loading={loadingTables}
              />
              {errors.table_id && <span className="form-error">{errors.table_id}</span>}
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