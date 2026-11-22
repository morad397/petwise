import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPetById } from '../services/dataService';

// Loads one pet from the API for the pet sub-pages (feeding, medical, vet visits, ...).
// The server checks ownership; if it says 403/404 we send the user back to "My Pets".
export default function usePet(petId) {
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getPetById(petId)
      .then((found) => {
        if (!cancelled) setPet(found);
      })
      .catch((error) => {
        if (cancelled) return;
        alert(
          error.status === 403
            ? 'Access Denied: You do not have permission to view this pet.'
            : error.message
        );
        navigate('/pets', { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [petId, navigate]);

  return { pet, loading };
}
