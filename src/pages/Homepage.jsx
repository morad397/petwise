import { Link } from 'react-router-dom';

function Homepage() {
  return (
    <div>
      <div className="navbar">
        <h2>PetWise</h2>
      </div>

      <div className="hero-section">
        <h1>Smart Pet Care Management</h1>
        <p>Your pets deserve the best care. We make it simple.</p>
        <p>Track feeding, vaccinations, vet visits, weight, and get AI-powered recommendations — all in one place.</p>
        <div className="hero-buttons">
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
          <Link to="/login" className="btn btn-outline">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default Homepage;