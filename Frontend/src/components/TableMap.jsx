import { useState } from 'react';

/**
 * Denah Ebony — digambar ulang persis dari sketsa tangan pengunjung:
 *
 * LANTAI 1 (bawah):
 *  - Kiri: Tangga melengkung + BAR (kotak di sketsa)
 *  - Kanan: kotak tembok-luar (garis di sketsa), isinya:
 *      atas = Taman + meja bulat, bawah = meja dekat Pintu (selatan)
 *  - Luar tembok: 3 meja di luar garis tembok
 *
 * LANTAI 2 (atas):
 *  - Kiri atas: TOILET, kiri: Tangga (naik dari L1)
 *  - Kanan: area besar bentuk "S" (tembok luar melengkung),
 *    pinggir tembok = meja semua isi 2 kursi + bangku beton
 *    menyatu ke tembok (tidak bisa dipindah).
 *
 * Legenda sketsa:
 *  - Kotak = bar / toilet (fasilitas, tidak bisa diklik)
 *  - Lingkaran = meja + kursi (bisa diklik kalau hijau)
 *  - Garis tebal = tembok luar
 */

const LAYOUT_BY_NAME = {
  // Lantai 1 — Taman (atas, dalam tembok)
  'L1-01': { floor: '1', zone: 'taman', shape: 'round' },
  'L1-02': { floor: '1', zone: 'taman', shape: 'round' },
  'L1-03': { floor: '1', zone: 'taman', shape: 'round' },
  'L1-04': { floor: '1', zone: 'taman', shape: 'round' },
  'L1-05': { floor: '1', zone: 'taman', shape: 'round' },
  // Lantai 1 — dekat Pintu (bawah)
  'L1-06': { floor: '1', zone: 'pintu', shape: 'round' },
  'L1-07': { floor: '1', zone: 'pintu', shape: 'round' },
  'L1-08': { floor: '1', zone: 'pintu', shape: 'round' },
  'L1-09': { floor: '1', zone: 'pintu', shape: 'round' },
  // Lantai 1 — luar tembok (3 meja di luar garis)
  'L1-10': { floor: '1', zone: 'luar', shape: 'round' },
  'L1-11': { floor: '1', zone: 'luar', shape: 'round' },
  'L1-12': { floor: '1', zone: 'luar', shape: 'round' },
  // Lantai 1 — tambahan nempel tembok
  'L1-13': { floor: '1', zone: 'taman', shape: 'round' },
  'L1-14': { floor: '1', zone: 'pintu', shape: 'round' },
  // Lantai 2 — kantong atas huruf S
  'L2-01': { floor: '2', zone: 'atas', shape: 'round' },
  'L2-02': { floor: '2', zone: 'atas', shape: 'round' },
  'L2-03': { floor: '2', zone: 'atas', shape: 'round' },
  'L2-04': { floor: '2', zone: 'atas', shape: 'round' },
  'L2-05': { floor: '2', zone: 'atas', shape: 'round' },
  'L2-06': { floor: '2', zone: 'atas', shape: 'round' },
  // Lantai 2 — kantong bawah huruf S (rooftop)
  'L2-07': { floor: '2', zone: 'bawah', shape: 'round' },
  'L2-08': { floor: '2', zone: 'bawah', shape: 'round' },
  'L2-09': { floor: '2', zone: 'bawah', shape: 'round' },
  'L2-10': { floor: '2', zone: 'bawah', shape: 'round' },
  'L2-11': { floor: '2', zone: 'bawah', shape: 'round' },
  'L2-12': { floor: '2', zone: 'bawah', shape: 'round' },
  // Lantai 2 — tambahan nempel tembok
  'L2-13': { floor: '2', zone: 'atas', shape: 'round' },
  'L2-14': { floor: '2', zone: 'atas', shape: 'round' },
  'L2-15': { floor: '2', zone: 'bawah', shape: 'round' },
  'L2-16': { floor: '2', zone: 'bawah', shape: 'round' },
  // Fallback nama lama / sementara — biar data lama tetap muncul
  'IN-01': { floor: '1', zone: 'taman', shape: 'square' },
  'IN-02': { floor: '1', zone: 'taman', shape: 'square' },
  'IN-03': { floor: '1', zone: 'taman', shape: 'round' },
  'IN-04': { floor: '1', zone: 'pintu', shape: 'square' },
  'IN-05': { floor: '1', zone: 'pintu', shape: 'round' },
  'IN-06': { floor: '1', zone: 'pintu', shape: 'banquet' },
  'OUT-01': { floor: '2', zone: 'atas', shape: 'square' },
  'OUT-02': { floor: '2', zone: 'atas', shape: 'round' },
  'OUT-03': { floor: '2', zone: 'atas', shape: 'square' },
  'OUT-04': { floor: '2', zone: 'bawah', shape: 'banquet' },
  'OUT-05': { floor: '2', zone: 'bawah', shape: 'square' },
  'OUT-06': { floor: '2', zone: 'bawah', shape: 'round' },
  'TG-01': { floor: '1', zone: 'taman', shape: 'square' },
  'TG-02': { floor: '1', zone: 'pintu', shape: 'square' },
  'Window 01': { floor: '1', zone: 'taman', shape: 'square' },
  'Window 02': { floor: '1', zone: 'taman', shape: 'square' },
  'Window 04': { floor: '1', zone: 'taman', shape: 'square' },
  'Table 01': { floor: '1', zone: 'pintu', shape: 'square' },
  'Table 02': { floor: '1', zone: 'pintu', shape: 'round' },
  'Outdoor 01': { floor: '2', zone: 'atas', shape: 'square' },
};

const ROOM_BY_AREA = {
  Indoor: '1',
  'Indoor / Semi-Indoor': '1',
  'Tangga Ikonik': '1',
  Tangga: '1',
  Outdoor: '2',
  'Outdoor / Rooftop / Taman': '2',
  Rooftop: '2',
  Taman: '1',
  'Luar Tembok': '1',
  Window: '1',
  'Main Hall': '1',
  Terrace: '2',
};

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
          style={{ transform: `rotate(${angle}deg) translate(34px) rotate(${-angle}deg)` }}
        />
      );
    }
    return <div className="fp-chairs fp-chairs--round">{chairs}</div>;
  }
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
  const shape = layout.shape || 'round';

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
      title={`${table.name} — ${table.area} — ${statusText}`}
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

/* Koordinat 3D (persen) — meniru sketsa: L1 taman atas, pintu bawah, luar di luar garis;
   L2 S-shape pinggir tembok. Kalau ada meja baru, otomatis disebar. */
const POS_3D = {
  'L1-01': { x: 30, y: 12 }, 'L1-02': { x: 52, y: 10 }, 'L1-03': { x: 72, y: 12 },
  'L1-04': { x: 34, y: 26 }, 'L1-05': { x: 58, y: 26 }, 'L1-13': { x: 78, y: 26 },
  'L1-06': { x: 32, y: 58 }, 'L1-07': { x: 54, y: 58 }, 'L1-08': { x: 74, y: 58 },
  'L1-09': { x: 40, y: 72 }, 'L1-14': { x: 64, y: 72 },
  'L1-10': { x: 30, y: 90 }, 'L1-11': { x: 55, y: 90 }, 'L1-12': { x: 78, y: 90 },
  'L2-01': { x: 32, y: 12 }, 'L2-02': { x: 50, y: 10 }, 'L2-03': { x: 68, y: 12 }, 'L2-04': { x: 82, y: 14 },
  'L2-05': { x: 36, y: 24 }, 'L2-06': { x: 56, y: 24 }, 'L2-13': { x: 74, y: 24 }, 'L2-14': { x: 84, y: 26 },
  'L2-07': { x: 28, y: 62 }, 'L2-08': { x: 48, y: 60 }, 'L2-09': { x: 68, y: 62 }, 'L2-10': { x: 82, y: 64 },
  'L2-11': { x: 36, y: 78 }, 'L2-12': { x: 56, y: 80 }, 'L2-15': { x: 74, y: 78 }, 'L2-16': { x: 86, y: 80 },
};

function pos3d(name, i, total) {
  if (POS_3D[name]) return POS_3D[name];
  const cols = 4;
  return { x: 22 + (i % cols) * 18, y: 14 + Math.floor(i / cols) * 16 };
}

function Table3D({ table, selectedId, onSelect, x, y }) {
  const isSelected = String(selectedId) === String(table.id);
  let status = 'available';
  if (table.is_booked) status = 'booked';
  else if (!table.fits_party) status = 'toosmall';
  if (isSelected) status = 'selected';
  const disabled = !table.is_available;
  return (
    <button
      type="button"
      className={`fp3d-table is-${status}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      disabled={disabled && !isSelected}
      onClick={() => onSelect && !disabled && onSelect(table.id)}
      title={`${table.name} — ${table.area} — 👥${table.capacity}`}
    >
      <span className="fp3d-cylinder"><span className="fp3d-top" /><span className="fp3d-side" /></span>
      <span className="fp3d-label">{table.name}<small>👥{table.capacity}</small></span>
      <span className="fp3d-chairs"><i /><i /></span>
    </button>
  );
}

export default function TableMap({ tables = [], selectedId = null, onSelect = null, loading = false, compact = false }) {
  const [floor, setFloor] = useState('1');
  const [view, setView] = useState('2d');

  if (loading) return <div className="tablemap-empty">Memuat denah meja...</div>;
  if (!tables || tables.length === 0) {
    return (
      <div className="tablemap-empty">
        Pilih tanggal, jam, dan jumlah tamu dulu untuk melihat denah meja yang kosong.
      </div>
    );
  }

  // Kelompokkan per lantai & zona sesuai sketsa
  const lt1taman = [];
  const lt1pintu = [];
  const lt1luar = [];
  const lt2atas = [];
  const lt2bawah = [];
  const other = [];
  tables.forEach((t) => {
    const lay = LAYOUT_BY_NAME[t.name];
    if (lay) {
      if (lay.floor === '1' && lay.zone === 'taman') lt1taman.push(t);
      else if (lay.floor === '1' && lay.zone === 'luar') lt1luar.push(t);
      else if (lay.floor === '1') lt1pintu.push(t);
      else if (lay.floor === '2' && lay.zone === 'atas') lt2atas.push(t);
      else lt2bawah.push(t);
    } else {
      const f = ROOM_BY_AREA[t.area];
      if (f === '1') lt1pintu.push(t);
      else if (f === '2') lt2bawah.push(t);
      else other.push(t);
    }
  });

  const availableCount = tables.filter((t) => t.is_available).length;
  const lt1Count = lt1taman.filter((t) => t.is_available).length + lt1pintu.filter((t) => t.is_available).length + lt1luar.filter((t) => t.is_available).length;
  const lt2Count = lt2atas.filter((t) => t.is_available).length + lt2bawah.filter((t) => t.is_available).length;

  // Kalau meja yang dipilih ada di lantai lain, ikutkan badge info
  const selectedTable = tables.find((t) => String(t.id) === String(selectedId));
  const selectedFloor = selectedTable ? (LAYOUT_BY_NAME[selectedTable.name]?.floor || ROOM_BY_AREA[selectedTable.area]) : null;

  return (
    <div className={`floorplan ${compact ? 'floorplan--compact' : ''}`}>
      <div className="fp-legend">
        <span className="fp-legend-item"><i className="dot dot--available" /> Kosong ({availableCount})</span>
        <span className="fp-legend-item"><i className="dot dot--booked" /> Terisi</span>
        <span className="fp-legend-item"><i className="dot dot--small" /> Kekecilan</span>
        <span className="fp-legend-item"><i className="dot dot--selected" /> Pilihanmu</span>
      </div>

      {/* Tab lantai — selalu tampil untuk 2D & 3D */}
      <div className="fp-floor-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={floor === '1'}
          className={`fp-floor-tab ${floor === '1' ? 'is-active' : ''}`}
          onClick={() => setFloor('1')}
        >
          Lantai 1 — Bar + Taman + Luar <small>kosong {lt1Count}</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={floor === '2'}
          className={`fp-floor-tab ${floor === '2' ? 'is-active' : ''}`}
          onClick={() => setFloor('2')}
        >
          Lantai 2 — Rooftop S + Toilet <small>kosong {lt2Count}</small>
        </button>
      </div>

      {/* Toggle 2D / 3D */}
      <div className="fp-view-toggle" role="tablist" aria-label="Mode tampilan">
        <button type="button" className={`fp-view-btn ${view === '2d' ? 'is-active' : ''}`} onClick={() => setView('2d')}>📄 2D Sketsa</button>
        <button type="button" className={`fp-view-btn ${view === '3d' ? 'is-active' : ''}`} onClick={() => setView('3d')}>🧊 3D Isometrik</button>
      </div>

      {view === '3d' ? (
        <div className="fp3d-wrap">
          <div className="fp3d-note">🧊 Gambar 3D — Lantai {floor} · lingkaran = meja, kotak = Bar/Toilet, garis = tembok, ▬ = bangku beton nempel tembok. Klik meja hijau untuk pilih.</div>
          <div className={`fp3d-scene ${floor === '2' ? 'fp3d-scene--lt2' : ''}`}>
            <div className="fp3d-back-wall" />
            <div className="fp3d-floor">
              {floor === '1' ? (
                <>
                  <div className="fp3d-room fp3d-room--taman"><span>TAMAN (dlm tembok)</span></div>
                  <div className="fp3d-tangga"><span>Tangga</span><i /><i /><i /></div>
                  <div className="fp3d-bar"><span>BAR</span></div>
                  <div className="fp3d-bench fp3d-bench--l1" title="Bangku tembok L1" />
                  <div className="fp3d-pintu">PINTU</div>
                  <div className="fp3d-outside">LUAR TEMBOK · 3 MEJA</div>
                  {[...lt1taman, ...lt1pintu, ...lt1luar].map((t, i, arr) => {
                    const p = pos3d(t.name, i, arr.length);
                    return <Table3D key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} x={p.x} y={p.y} />;
                  })}
                </>
              ) : (
                <>
                  <div className="fp3d-room fp3d-room--s"><span>BENTUK S · pinggir tembok @2 kursi</span></div>
                  <div className="fp3d-tangga"><span>Tangga</span><i /><i /><i /></div>
                  <div className="fp3d-toilet"><span>TOILET</span></div>
                  <div className="fp3d-bench fp3d-bench--top" title="Bangku beton nempel tembok atas" />
                  <div className="fp3d-bench fp3d-bench--bottom" title="Bangku beton nempel tembok bawah" />
                  <div className="fp3d-s-curve" />
                  {[...lt2atas, ...lt2bawah].map((t, i, arr) => {
                    const p = pos3d(t.name, i, arr.length);
                    return <Table3D key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} x={p.x} y={p.y} />;
                  })}
                </>
              )}
            </div>
            <div className="fp3d-front-wall" />
          </div>
        </div>
      ) : null}

      {view === '2d' && (
      <>
      {selectedTable && selectedFloor && selectedFloor !== floor && (
        <div className="fp-floor-hint">
          Meja pilihanmu <strong>{selectedTable.name}</strong> ada di <strong>Lantai {selectedFloor}</strong> — klik tab Lantai {selectedFloor} untuk melihatnya.
        </div>
      )}

      {floor === '1' ? (
        <div className="fp-building">
          <div className="fp-sketch fp-sketch--lt1">
            {/* KIRI: tangga + bar — persis sketsa L1 */}
            <div className="fp-sketch-left">
              <div className="fp-sketch-label">Lantai 1</div>
              <div className="fp-tangga-curve" title="Tangga di sketsa kiri">
                <span>Tangga</span>
              </div>
              <div className="fp-bar-box" title="Kotak = bar (sketsa)">
                <strong>BAR</strong>
                <small>kotak di sketsa</small>
              </div>
            </div>
            {/* KANAN: tembok luar + taman + pintu */}
            <div className="fp-walled" title="Garis = tembok luar">
              <div className="fp-walled-tag">— tembok luar —</div>
              <div className="fp-zone">
                <div className="fp-zone-head">
                  <span className="fp-zone-title">🌳 Taman (dlm tembok)</span>
                  <span className="fp-taman-mark" title="Tulisan Taman + garis ganda di sketsa">= Taman</span>
                </div>
                <div className="fp-tables">
                  {lt1taman.map((t) => (
                    <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
                  ))}
                  {lt1taman.length === 0 && <div className="fp-room-empty">Tidak ada meja taman</div>}
                </div>
              </div>
              <div className="fp-zone fp-zone--pintu">
                <div className="fp-zone-head">
                  <span className="fp-zone-title">Meja dekat Pintu</span>
                </div>
                <div className="fp-tables">
                  {lt1pintu.map((t) => (
                    <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
                  ))}
                  {lt1pintu.length === 0 && <div className="fp-room-empty">Tidak ada meja pintu</div>}
                </div>
              </div>
              <div className="fp-pintu" title="Pintu di bawah (sketsa L1)">— PINTU (bawah) —</div>
            </div>
            {/* LUAR TEMBOK: 3 meja di luar garis */}
            <div className="fp-outside" title="3 meja di luar tembok (L1)">
              <div className="fp-outside-tag">luar tembok — 3 meja</div>
              <div className="fp-tables fp-tables--outside">
                {lt1luar.map((t) => (
                  <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
                ))}
                {lt1luar.length === 0 && <div className="fp-room-empty">Tidak ada meja luar</div>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fp-building">
          <div className="fp-sketch fp-sketch--lt2">
            {/* KIRI: toilet + tangga */}
            <div className="fp-sketch-left">
              <div className="fp-sketch-label">Lantai 2</div>
              <div className="fp-toilet-box" title="Toilet kiri atas (sketsa L2)">
                <strong>TOILET</strong>
              </div>
              <div className="fp-tangga-curve fp-tangga-curve--lt2" title="Tangga kiri (sketsa L2) — naik dari L1">
                <span>Tangga</span>
                <small>naik dari L1</small>
              </div>
            </div>
            {/* KANAN: huruf S — pinggir tembok meja semua isi 2 kursi */}
            <div className="fp-walled fp-walled--s" title="Garis S = tembok luar L2">
              <div className="fp-walled-tag">— tembok luar (bentuk S) · pinggir tembok = meja semua @2 kursi —</div>
              <div className="fp-bench" title="Bangku beton menyatu ke tembok">▬▬ bangku beton nempel tembok (menyatu, tidak bisa dipindah) ▬▬</div>
              <div className="fp-zone">
                <div className="fp-zone-head">
                  <span className="fp-zone-title">Kantong atas S — pinggir tembok</span>
                  <small className="fp-zone-sub">meja semua @2 kursi</small>
                </div>
                <div className="fp-tables">
                  {lt2atas.map((t) => (
                    <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
                  ))}
                  {lt2atas.length === 0 && <div className="fp-room-empty">Tidak ada meja</div>}
                </div>
              </div>
              <div className="fp-s-neck" title="Lekukan S di sketsa">〜 lekukan S 〜</div>
              <div className="fp-zone">
                <div className="fp-zone-head">
                  <span className="fp-zone-title">Kantong bawah S — Rooftop</span>
                  <small className="fp-zone-sub">⛰ view Slamet · meja @2 kursi + bangku beton tembok</small>
                </div>
                <div className="fp-tables">
                  {lt2bawah.map((t) => (
                    <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
                  ))}
                  {lt2bawah.length === 0 && <div className="fp-room-empty">Tidak ada meja</div>}
                </div>
              </div>
              <div className="fp-bench" title="Bangku beton menyatu ke tembok">▬▬ bangku beton nempel tembok ▬▬</div>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {other.length > 0 && (
        <div className="fp-room fp-room--other">
          <div className="fp-room-head"><div className="fp-room-title">🪑 Area Lainnya</div></div>
          <div className="fp-tables">
            {other.map((t) => (
              <TableUnit key={t.id} table={t} selectedId={selectedId} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}

      <div className="fp-howto">
        <strong>Cara baca (ikut sketsa Anda):</strong> lingkaran = meja + kursi, kotak = Bar / Toilet (tidak bisa diklik),
        garis tebal = tembok luar. Lantai 1: tangga + Bar di kiri, Taman + meja di kanan atas dalam tembok, Pintu di bawah,
        + 3 meja di <em>luar tembok</em>. Lantai 2: Toilet + Tangga di kiri, area S kanan = meja pinggir tembok semua @2 kursi
        + <em>bangku beton menyatu ke tembok</em>. Klik meja <em>hijau</em> untuk memilih.
      </div>

      {availableCount === 0 && (
        <div className="tablemap-full">
          Semua meja yang muat sudah terisi di jam ini (termasuk booking offline / WA).
          Silakan pilih jam lain atau hubungi admin via WhatsApp.
        </div>
      )}
    </div>
  );
}
