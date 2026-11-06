import Toggle from '../ui/Toggle';

export default function GalleryAdminCard({ gallery, onToggle, onEdit, onDelete }) {
  const isActive = gallery.is_active === true || gallery.is_active === 1;

  return (
    <div className="menu-admin-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <div className="menu-admin-card__image" style={{ position: 'relative' }}>
        <img
          src={gallery.image_url}
          alt={gallery.title || gallery.caption || 'Ebony Gallery'}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80';
          }}
        />

        {/* Lencana Urutan */}
        {gallery.order !== undefined && gallery.order !== null && (
          <span className="menu-admin-card__image-badge">
            #{gallery.order}
          </span>
        )}

        {/* Lencana Status Aktif / Disembunyikan */}
        {!isActive && (
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#6b7280',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '20px',
            letterSpacing: '0.03em'
          }}>
            DISEMBUNYIKAN
          </span>
        )}
      </div>

      <div className="menu-admin-card__body" style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        padding: '16px'
      }}>
        <div>
          <h3 className="menu-admin-card__name" style={{ fontSize: '15px', marginBottom: '6px' }}>
            {gallery.title || 'Foto Galeri'}
          </h3>
          <p className="menu-admin-card__desc" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '36px',
            margin: '4px 0 12px 0',
            fontSize: '12px',
            color: 'var(--color-muted)'
          }}>
            {gallery.caption || 'Tanpa keterangan'}
          </p>
        </div>

        <div className="menu-admin-card__actions" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Toggle
              checked={isActive}
              onChange={onToggle}
              label={isActive ? 'Tampil di Web' : 'Sembunyi'}
            />
          </div>

          <div className="menu-admin-card__btns">
            <button className="btn--edit" onClick={onEdit}>EDIT</button>
            <button className="btn--delete-icon" onClick={onDelete} title="Hapus Foto">
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

