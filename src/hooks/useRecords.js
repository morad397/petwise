import { useCallback, useEffect, useState } from 'react';

// Loads one kind of medical record for a pet and gives a reload function.
// api: vaccinationsApi | treatmentsApi | weightsApi from medicalService.js
export default function useRecords(api, petId, enabled = true) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  const reload = useCallback(
    () =>
      api
        .list(petId)
        .then((list) => {
          setRecords(list);
          setError('');
        })
        .catch((e) => setError(e.message)),
    [api, petId]
  );

  useEffect(() => {
    if (enabled) reload();
  }, [reload, enabled]);

  return { records, error, reload };
}
