import Toggle from '../ui/Toggle';

export default function MenuAdminCard({ menu, onToggle, onEdit, onDelete }) {
  return (
    <div className="menu-admin-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%', 
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <div className="menu-admin-card__image" style={{ position: 'relative' }}>
        <img src={menu.image_url} alt={menu.name} />
        
        {/* Lencana Kategori */}
        <span className="menu-admin-card__image-badge">
          {menu.category}
        </span>
        
        {/* Lencana Penanda Aktif Promo */}
        {(menu.is_promo === 1 || menu.is_promo === true) && (
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#d4af37', 
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            PROMO BANNER
          </span>
        )}

        {/* Lencana Status Habis */}
        {!menu.is_available && (
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '20px',
            letterSpacing: '0.03em'
          }}>
            HABIS
          </span>
        )}
      </div>
      
      {/* Bagian Body Kartu */}
      <div className="menu-admin-card__body" style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        padding: '16px'
      }}>
        <div>
          <div className="menu-admin-card__header">
            <h3 className="menu-admin-card__name">{menu.name}</h3>
            <span className="menu-admin-card__price">
              Rp {menu.price?.toLocaleString('id-ID') || '0'}
            </span>
          </div>
          
          {/* KOREKSI FIX: Kata 'vertical' sekarang sudah memakai tanda petik yang benar */}
          <p className="menu-admin-card__desc" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '40px', 
            margin: '8px 0 16px 0'
          }}>
            {menu.description}
          </p>
        </div>
        
        {/* Aksi Baris Bawah */}
        <div className="menu-admin-card__actions" style={{ marginTop: 'auto' }}>
          <div>
            <Toggle 
              checked={menu.is_available} 
              onChange={onToggle}
              label={menu.is_available ? 'Available' : 'Sold Out'}
            />
            {!menu.is_available && (
              <p style={{
                margin: '4px 0 0',
                fontSize: '0.68rem',
                color: '#f59e0b',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                🤖 AI chatbot sudah tahu menu ini habis
              </p>
            )}
          </div>
          
          <div className="menu-admin-card__btns">
            <button className="btn--edit" onClick={onEdit}>EDIT</button>
            <button className="btn--delete-icon" onClick={onDelete} title="Delete">
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
