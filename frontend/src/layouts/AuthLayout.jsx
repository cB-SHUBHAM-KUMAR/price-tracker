import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-brand">{/* Logo / brand goes here */}</div>
        <div className="auth-form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
