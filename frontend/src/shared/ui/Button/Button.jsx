import './Button.css';

function Button({ children, variant = 'primary', size = 'md', isLoading = false, ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${isLoading ? 'btn--loading' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <span className="btn-spinner" /> : children}
    </button>
  );
}

export default Button;
