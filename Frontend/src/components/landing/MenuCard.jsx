export default function MenuCard({ menu }) {
  return (
    <div className="menu-card">
      <div className="menu-card__image-wrap">
        <img
          src={menu.image_url}
          alt={menu.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=60';
          }}
        />
        <span className="menu-card__badge">{menu.badge || menu.category}</span>
      </div>
      <div className="menu-card__body">
        <h3 className="menu-card__name">{menu.name}</h3>
        <p className="menu-card__desc">{menu.description}</p>
      </div>
    </div>
  );
}
