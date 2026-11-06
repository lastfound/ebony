export default function MenuCard({ menu }) {
  const fallbackImg = '/assets/images/pastry.jfif';
  const initialSrc = menu?.image_url || fallbackImg;

  return (
    <div className="menu-card">
      <div className="menu-card__image-wrap">
        <img
          src={initialSrc}
          alt={menu?.name || 'Menu Ebony'}
          width="360"
          height="360"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImg;
          }}
        />
        <span className="menu-card__badge">{menu?.badge || menu?.category}</span>
      </div>
      <div className="menu-card__body">
        <h3 className="menu-card__name">{menu?.name}</h3>
        <p className="menu-card__desc">{menu?.description}</p>
      </div>
    </div>
  );
}
