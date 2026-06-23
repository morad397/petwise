import { useParams, Link } from 'react-router-dom';

const samplePets = [
  { id: 1, name: 'Luna', species: 'Cat', breed: 'British Shorthair', weight: '4.2 kg', age: 3 },
  { id: 2, name: 'Rex', species: 'Dog', breed: 'Golden Retriever', weight: '28 kg', age: 5 },
];

function PetProfile() {
  const { id } = useParams();
  const pet = samplePets.find((p) => p.id === Number(id));

  if (!pet) {
    return <p>Pet not found</p>;
  }

  return (
    <div>
      <Link to="/">← Back to Dashboard</Link>
      <h1>{pet.name}</h1>
      <p>Species: {pet.species}</p>
      <p>Breed: {pet.breed}</p>
      <p>Weight: {pet.weight}</p>
      <p>Age: {pet.age} years</p>

      <h3>Quick Links</h3>
      <Link to={`/pets/${pet.id}/feeding`}>Feeding Schedule</Link>
      <br />
      <Link to={`/pets/${pet.id}/vaccinations`}>Vaccinations & Medications</Link>
      <br />
      <Link to={`/pets/${pet.id}/vet-visits`}>Vet Visits</Link>
      <br />
      <Link to={`/pets/${pet.id}/weight`}>Weight & Habits</Link>
      <br />
      <Link to={`/pets/${pet.id}/recommendations`}>Recommendations</Link>
    </div>
  );
}

export default PetProfile;