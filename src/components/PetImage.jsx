import { useState, useEffect } from 'react';

const dogPlaceholder = 'https://images.unsplash.com/photo-1543466835-00a735c71810?auto=format&fit=crop&w=400&q=80';
const catPlaceholder = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80';
const genericPetPlaceholder = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80';

export const getSpeciesPlaceholder = (species) => {
  const normalizedSpecies = species?.trim().toLowerCase();
  if (normalizedSpecies === 'dog') {
    return dogPlaceholder;
  }
  if (normalizedSpecies === 'cat') {
    return catPlaceholder;
  }
  return genericPetPlaceholder;
};

export default function PetImage({ pet, className = '', style = {} }) {
  const initialSrc = pet?.imageUrl || getSpeciesPlaceholder(pet?.species);
  const [src, setSrc] = useState(initialSrc);

  useEffect(() => {
    setSrc(pet?.imageUrl || getSpeciesPlaceholder(pet?.species));
  }, [pet?.id, pet?.imageUrl, pet?.species]);

  const handleError = () => {
    const fallback = getSpeciesPlaceholder(pet?.species);
    if (src !== fallback) {
      setSrc(fallback);
    }
  };

  return (
    <img
      src={src}
      alt={`${pet?.name} — ${pet?.species}`}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
