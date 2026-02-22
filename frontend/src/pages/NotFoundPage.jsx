import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}

export default NotFoundPage;
