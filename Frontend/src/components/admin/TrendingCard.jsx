export default function TrendingCard({ item }) {
  return (
    <div className="trending-card">
      <img src={item.image_url} alt={item.name} className="trending-card__img" />
      <div className="trending-card__overlay"></div>
      <div className="trending-card__content">
        <span className="trending-card__tag">TRENDING ITEM</span>
        <h3 className="trending-card__name">{item.name}</h3>
        <p className="trending-card__desc">{item.description}</p>
      </div>
    </div>
  );
}
