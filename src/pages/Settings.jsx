import { Link } from 'react-router-dom';

function Settings() {
  return (
    <div>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h1>Settings</h1>

      <h3>Profile</h3>
      <div>
        <label>Full Name:</label>
        <br />
        <input type="text" placeholder="Enter your name" />
      </div>
      <br />
      <div>
        <label>Email:</label>
        <br />
        <input type="email" placeholder="Enter your email" />
      </div>
      <br />

      <h3>Notifications</h3>
      <div>
        <input type="checkbox" /> Feeding reminders
      </div>
      <div>
        <input type="checkbox" /> Vaccination reminders
      </div>
      <div>
        <input type="checkbox" /> Vet visit reminders
      </div>
      <br />

      <h3>Language</h3>
      <div>
        <select>
          <option value="en">English</option>
          <option value="he">עברית</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <br />

      <button type="button">Save Settings</button>
    </div>
  );
}

export default Settings;