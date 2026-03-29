const API_BASE_URL = '/api';

export const apiService = {
  rsa: {
    encrypt: async (message: string) => {
      const response = await fetch(`${API_BASE_URL}/rsa/encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return response.json();
    },
    decrypt: async (ciphertext: string, originalMessage: string) => {
      const response = await fetch(`${API_BASE_URL}/rsa/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertext, originalMessage }),
      });
      return response.json();
    },
  },
  pqc: {
    encrypt: async (message: string) => {
      const response = await fetch(`${API_BASE_URL}/pqc/encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return response.json();
    },
    decrypt: async (ciphertext: string, originalMessage: string) => {
      const response = await fetch(`${API_BASE_URL}/pqc/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertext, originalMessage }),
      });
      return response.json();
    },
  },
  chat: {
    send: async (from: string, message: string, ciphertext: string) => {
      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, message, ciphertext }),
      });
      return response.json();
    },
  },
};
