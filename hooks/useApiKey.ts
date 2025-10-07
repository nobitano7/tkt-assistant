

import { useState, useEffect } from 'react';

// FIX: Per guidelines, API key must come from process.env.API_KEY and no UI should be presented for it.
export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState<boolean>(true);

  useEffect(() => {
    // We assume process.env.API_KEY is available in the execution context.
    const key = process.env.API_KEY;
    if (key) {
      setApiKey(key);
    } else {
      // As per guidelines, the app should not ask for the key.
      // It's assumed to be pre-configured. If not, services will fail.
      console.error("API_KEY environment variable is not set.");
    }
    setIsLoadingKey(false);
  }, []);
  
  return {
    apiKey,
    saveApiKey: () => {}, // No-op
    isApiKeyModalOpen: false, // Per guidelines, modal should never open.
    openApiKeyModal: () => {}, // No-op
    isLoadingKey,
  };
};
