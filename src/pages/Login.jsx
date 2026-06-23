import { Link } from 'react-router-dom';

function Login() {
  return (
    <div>
      <h1>PetWise</h1>
      <p>Welcome! Please log in to continue.</p>

      <form>
        <div>
          <label>Email:</label>
          <br />
          <input type="email" placeholder="Enter your email" />
        </div>
        <br />

        <div>
          <label>Password:</label>
          <br />
          <input type="password" placeholder="Enter your password" />
        </div>
        <br />

        <div>
          <label>Login as:</label>
          <br />
          <select>
            <option value="">Select role</option>
            <option value="owner">Pet Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <br />

        <Link to="/dashboard">
          <button type="button">Log In</button>
        </Link>
      </form>

      <br />
      <p>Don't have an account?</p>
      <Link to="/signup">Sign Up</Link>
    </div>
  );
}

export default Login;