import { Link } from 'react-router-dom';

function AddPet() {
  return (
    <div>
      <Link to="/">← Back to Dashboard</Link>
      <h1>Add New Pet</h1>

      <form>
        <div>
          <label>Pet Name:</label>
          <br />
          <input type="text" placeholder="Enter pet name" />
        </div>
        <br />

        <div>
          <label>Species:</label>
          <br />
          <select>
            <option value="">Select species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
          </select>
        </div>
        <br />

        <div>
          <label>Breed:</label>
          <br />
          <input type="text" placeholder="Enter breed" />
        </div>
        <br />

        <div>
          <label>Age:</label>
          <br />
          <input type="number" placeholder="Enter age" />
        </div>
        <br />

        <div>
          <label>Weight (kg):</label>
          <br />
          <input type="text" placeholder="Enter weight" />
        </div>
        <br />

        <div>
          <label>Upload Photo:</label>
          <br />
          <input type="file" />
        </div>
        <br />

        <button type="button">Add Pet</button>
      </form>
    </div>
  );
}

export default AddPet;