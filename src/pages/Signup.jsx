import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div>
      <h1>PetWise - Sign Up</h1>

      <form>
        <div>
          <label>Full Name:</label>
          <br />
          <input type="text" placeholder="Enter your full name" />
        </div>
        <br />

        <div>
          <label>Email:</label>
          <br />
          <input type="email" placeholder="Enter your email" />
        </div>
        <br />

        <div>
          <label>Password:</label>
          <br />
          <input type="password" placeholder="Create a password" />
        </div>
        <br />

        <div>
          <label>Confirm Password:</label>
          <br />
          <input type="password" placeholder="Confirm your password" />
        </div>
        <br />

        <div>
          <label>Register as:</label>
          <br />
          <select>
            <option value="">Select role</option>
            <option value="owner">Pet Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <br />

        <Link to="/login">
          <button type="button">Sign Up</button>
        </Link>
      </form>

      <br />
      <p>Already have an account?</p>
      <Link to="/login">Log In</Link>
    </div>
  );
}

export default Signup;