/**
 * Denah lantai (floor plan) Ebony Cafe — versi realistis per ruangan.
 *
 * Cara baca denah:
 * - Atas = dinding kaca (Window) — meja nempel jendela, view keluar.
 * - Tengah = Main Hall (indoor ber-AC).
 * - Bawah = Terrace (outdoor) — udara terbuka Baturaden.
 * - Kanan = VIP Lounge — ruangan privat berpintu.
 * - Kiri bawah = pintu masuk utama.
 *
 * Warna meja:
 * - Hijau = kosong, bisa diklik/dipilih
 * - Merah = sudah terisi (web / AI / WA / offline), tidak bisa diklik
 * - Abu = kapasitasnya kekecilan untuk jumlah tamu, tidak bisa diklik
 * - Emas = meja yang sedang dipilih
 */
const LAYOUT_BY_NAME = {
  'Window 01': { room: 'window', shape: 'square' },
  'Window 02': { room: 'window', shape: 'square' },
  'Window 04': { room: 'window', shape: 'square' },
  'Table 01': { room: 'hall', shape: 'square' },
  'Table 02': { room: 'hall', shape: 'round' },
  'Outdoor 01': { room: 'terrace', shape: 'square' },
  'VIP Suite': { room: 'vip', shape: 'banquet' },
};

const ROOM_BY_AREA = {
  Window: 'window',
  'Main Hall': 'hall',
  Terrace: 'terrace',
  'VIP Lounge': 'vip',
};

const ROOMS = [
  {
    id: 'window',
    title: '🪟 Dinding Kaca — Window',
    desc: 'Meja di pinggir jendela, view keluar',
    className: 'fp-room--window',
  },
  {
    id: 'hall',
    title: '🏠 Main Hall (Indoor)',
    desc: 'Ruangan utama ber-AC di tengah cafe',
    className: 'fp-room--hall',
  },
  {
    id: 'terrace',
    title: '🌿 Terrace (Outdoor)',
    desc: 'Area terbuka, udara sejuk Baturaden',
    className: 'fp-room--terrace',
  },
  {
    id: 'vip',
    title: '✨ VIP Lounge',
    desc: 'Ruangan privat berpintu, cocok untuk acara khusus',
    className: 'fp-room--vip',
  },
];

function chairsFor(table, shape) {
  const n = Math.max(0, Math.min(table.capacity || 0, 12));
  const chairs = [];
  if (shape === 'round') {
    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i - 90;
      chairs.push(
        <span
          key={i}
          className="fp-chair"
          style={{
            transform: `rotate(${angle}deg) translate(34px) rotate(${-angle}deg)`,
          }}
        />
      );
    }
    return <div className="fp-chairs fp-chairs--round">{chairs}</div>;
  }
  // square / banquet: bagi kursi ke sisi atas, bawah, kiri, kanan
  const perSide = Math.ceil(n / 4);
  const sides = ['top', 'bottom', 'left', 'right'];
  let idx = 0;
  return (
    <div className="fp-chairs">
      {sides.map((side) => {
        const count = Math.min(perSide, n - idx);
        if (count <= 0) return null;
        const items = [];
        for (let i = 0; i < count; i++) {
          items.push(<span key={`${side}-${i}`} className="fp-chair" />);
          idx += 1;
        }
        return (
          <div key={side} className={`fp-side fp-side--${side}`}>
            {items}
          </div>
        );
      })}
    </div>
  );
}

function TableUnit({ table, selectedId, onSelect }) {
  const isSelected = String(selectedId) === String(table.id);
  const disabled = !table.is_available;
  const layout = LAYOUT_BY_NAME[table.name] || {};
  const shape = layout.shape || (table.capacity >= 8 ? 'banquet' : table.capacity >= 6 ? 'round' : 'square');

  let status = 'available';
  let statusText = `Muat ${table.capacity} orang`;
  if (table.is_booked) {
    status = 'booked';
    statusText = 'Terisi';
  } else if (!table.fits_party) {
    status = 'toosmall';
    statusText = `Kekecilan (muat ${table.capacity})`;
  }
  if (isSelected) status = 'selected';

  return (
    <button
      type="button"
      className={`fp-table fp-table--${shape} is-${status}`}
      disabled={disabled && !isSelected}
      onClick={() => onSelect && !disabled && onSelect(table.id)}
      title={`${table.name} — ${table.area} — ${statusText}${table.is_booked ? ' (sudah dibooking)' : ''}`}
    >
      <span className="fp-table-wrap">
        {chairsFor(table, shape)}
        <span className={`fp-top fp-top--${shape}`}>
          <span className="fp-table-name">{table.name}</span>
          <span className="fp-table-cap">👥 {table.capacity}</span>
        </span>
      </span>
      <span className={`fp-badge fp-badge--${status}`}>
        {status === 'booked' && 'Terisi'}
        {status === 'toosmall' && 'Kecil'}
        {status === 'selected' && 'Dipilih ✓'}
        {status === 'available' && 'Kosong'}
      </span>
    </button>
  );
}

export default function TableMap({ tables = [], selectedId = null, onSelect = null, loading = false, compact = false }) {
  if (loading) {
    return <div className="tablemap-empty">Memuat denah meja...</div>;
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="tablemap-empty">
        Pilih tanggal, jam, dan jumlah tamu dulu untuk melihat denah meja yang kosong.
      </div>
    );
  }

  const byRoom = { window: [], hall: [], terrace: [], vip: [], other: [] };
  tables.forEach((t) => {
    const room = LAYOUT_BY_NAME[t.name]?.room || ROOM_BY_AREA[t.area] || 'other';
    (byRoom[room] || byRoom.other).push(t);
  });

  const availableCount = tables.filter((t) => t.is_available).length;

  return (
    <div className={`floorplan ${compact ? 'floorplan--compact' : ''}`}>
      <div className="fp-legend">
        <span className="fp-legend-item"><i className="dot dot--available" /> Kosong ({availableCount})</span>
        <span className="fp-legend-item"><i className="dot dot--booked" /> Terisi</span>
        <span className="fp-legend-item"><i className="dot dot--small" /> Kekecilan</span>
        <span className="fp-legend-item"><i className="dot dot--selected" /> Pilihanmu</span>
      </div>

      <div className="fp-building">
        <div className="fp-wall fp-wall--glass" title="Dinding kaca">🪟 DINDING KACA</div>

        <div className="fp-main">
          <div className="fp-left">
            {ROOMS.filter((r) => ['window', 'hall', 'terrace'].includes(r.id)).map((room) => (
              <div key={room.id} className={`fp-room ${room.className}`}>
                <div className="fp-room-head">
                  <div className="fp-room-title">{room.title}</div>
                  <div className="fp-room-desc">{room.desc}</div>
                </div>
                <div className="fp-tables">
                  {(byRoom[room.id].length > 0 ? byRoom[room.id] : []).map((t) => (
                    <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
                  ))}
                  {byRoom[room.id].length === 0 && (
                    <div className="fp-room-empty">Tidak ada meja di area ini</div>
                  )}
                </div>
              </div>
            ))}
            <div className="fp-entrance" title="Pintu masuk utama">🚪 PINTU MASUK</div>
          </div>

          <div className={`fp-room fp-room--vip ${ROOMS[3].className}`}>
            <div className="fp-room-head">
              <div className="fp-room-title">{ROOMS[3].title}</div>
              <div className="fp-room-desc">{ROOMS[3].desc}</div>
            </div>
            <div className="fp-door" title="Pintu VIP">🚪 pintu</div>
            <div className="fp-tables fp-tables--vip">
              {byRoom.vip.map((t) => (
                <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
              ))}
              {byRoom.vip.length === 0 && (
                <div className="fp-room-empty">Tidak ada meja di area ini</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {byRoom.other.length > 0 && (
        <div className="fp-room fp-room--other">
          <div className="fp-room-head">
            <div className="fp-room-title">🪑 Area Lainnya</div>
          </div>
          <div className="fp-tables">
            {byRoom.other.map((t) => (
              <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}

      <div className="fp-howto">
        <strong>Cara baca denah:</strong> posisi meja di gambar = posisi asli di cafe.
        Meja dekat <em>Dinding Kaca</em> berarti persis di pinggir jendela,
        <em> Main Hall</em> di tengah ruangan, <em>Terrace</em> di area outdoor bawah,
        dan <em>VIP Suite</em> di dalam ruangan privat kanan.
        Klik meja <em>hijau (Kosong)</em> untuk memilih — begitu dikonfirmasi admin,
        kamu langsung diarahkan ke meja tersebut.
      </div>

      {availableCount === 0 && (
        <div className="tablemap-full">
          Semua meja yang muat sudah terisi di jam ini (termasuk booking offline / WA).
          Silakan pilih jam lain atau hubungi admin via WhatsApp untuk dibantu carikan meja pengganti.
        </div>
      )}
    </div>
  );
}
