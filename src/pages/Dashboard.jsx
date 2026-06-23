import { Link } from 'react-router-dom';

const samplePets = [
  { id: 1, name: 'Luna', species: 'Cat', breed: 'British Shorthair' },
  { id: 2, name: 'Rex', species: 'Dog', breed: 'Golden Retriever' },
];

function Dashboard() {
  return (
    <div>
      <div>
        <Link to="/settings">Settings</Link>
        {' | '}
        <Link to="/">Logout</Link>
      </div>

      <h1>My Pets</h1>
      <Link to="/add-pet">+ Add New Pet</Link>

      <div>
        {samplePets.map((pet) => (
          <Link key={pet.id} to={`/pets/${pet.id}`}>
            <div>
              <h3>{pet.name}</h3>
              <p>{pet.species} - {pet.breed}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;