const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Kochi', 'Goa',
];

const CitySelector = ({ value, onChange }) => (
  <div className="relative">
    <select
      id="city-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-select appearance-none pr-10"
    >
      <option value="">Select city…</option>
      {CITIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
      ▾
    </span>
  </div>
);

export default CitySelector;
