
import { useState, useEffect, useCallback } from 'react';

const API_KEY_STORAGE_KEY = 'GEMINI_API_KEY';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isLoadingKey, setIsLoadingKey] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedApiKey) {
        setApiKey(storedApiKey);
      } else {
        // Only show the modal on initial load if no key is found.
        setIsApiKeyModalOpen(true);
      }
    } finally {
      setIsLoadingKey(false);
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKey(key);
      setIsApiKeyModalOpen(false);
    }
  }, []);

  const openApiKeyModal = useCallback(() => {
    setIsApiKeyModalOpen(true);
  }, []);

  return {
    apiKey,
    saveApiKey,
    isApiKeyModalOpen,
    openApiKeyModal,
    isLoadingKey,
  };
};
