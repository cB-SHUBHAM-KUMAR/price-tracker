import './Input.css';

function Input({ label, error, id, ...props }) {
  return (
    <div className={`input-group ${error ? 'input-group--error' : ''}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className="input-field" {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}

export default Input;
