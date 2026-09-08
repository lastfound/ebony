import Toggle from '../ui/Toggle';

export default function MenuAdminCard({ menu, onToggle, onEdit, onDelete }) {
  return (
    <div className="menu-admin-card">
      <div className="menu-admin-card__image">
        <img src={menu.image_url} alt={menu.name} />
        <span className="menu-admin-card__image-badge">
          {menu.category}
        </span>
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
          <Toggle 
            checked={menu.is_available} 
            onChange={onToggle}
            label={menu.is_available ? 'Available' : 'Sold Out'}
          />
          
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
