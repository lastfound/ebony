import Toggle from '../ui/Toggle';

export default function MenuAdminCard({ menu, onToggle, onEdit, onDelete }) {
  return (
    <div className="menu-admin-card">
      <div className="menu-admin-card__image">
        <img src={menu.image_url} alt={menu.name} />
        <span className="menu-admin-card__image-badge">
          {menu.category}
        </span>
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
      
      <div className="menu-admin-card__body">
        <div className="menu-admin-card__header">
          <h3 className="menu-admin-card__name">{menu.name}</h3>
          <span className="menu-admin-card__price">
            Rp {menu.price?.toLocaleString('id-ID') || '0'}
          </span>
        </div>
        
        <p className="menu-admin-card__desc">{menu.description}</p>
        
        <div className="menu-admin-card__actions">
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
