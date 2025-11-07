// Utility para obtener el token del localStorage
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Utility para hacer fetch con autenticación
export const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}${url}`, {
    ...options,
    headers,
  });

  return response;
};
