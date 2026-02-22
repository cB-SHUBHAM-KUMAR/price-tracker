function Loader({ size = 'md', text = '' }) {
  return (
    <div className={`loader loader--${size}`}>
      <div className="loader-spinner" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}

export default Loader;
