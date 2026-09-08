export default function Toggle({ checked, onChange, label }) {
  return (
    <div className="toggle-wrap">
      <span className={`toggle-label ${!checked ? 'toggle-label--soldout' : ''}`}>
        {checked ? 'Available' : 'Sold Out'}
      </span>
      <label className="toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="toggle__input"
        />
        <span className="toggle__slider" />
      </label>
    </div>
  );
}
