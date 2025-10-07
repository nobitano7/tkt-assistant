import React from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

// FIX: Per guidelines, no UI should be presented for API key management. This component now returns null.
export const ApiKeyModal: React.FC<ApiKeyModalProps> = () => {
  return null;
};
