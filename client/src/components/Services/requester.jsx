import { handle401Error } from '../../utils/handle401Error';
import { refreshToken } from '../../utils/refreshToken';

const requester = async (method, url, data) => {
  const options = {
    credentials: 'include',
  };

  if (method !== 'GET') {
    options.method = method;

    if (data) {
      options.headers = {
        'content-type': 'application/json',
      };

      options.body = JSON.stringify(data);
    }
  }

  const serializedAuth = localStorage.getItem('auth');
  if (serializedAuth) {
    const auth = JSON.parse(serializedAuth);
    if (auth.token) {
      const accessToken = await refreshToken(auth);
      if (!accessToken) return window.location.replace('/sign-up');
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  }

  const response = await fetch(url, options);

  const result = await response.json();
  if (response.status === 401) {
    handle401Error(); 
  
  }
  if (!response.ok) {
    if (response.status === 401) return window.location.replace('/sign-up');
    throw result;
  }

  return result;
};

export const requestFactory = () => {
  return {
    get: requester.bind(null, 'GET'),
    post: requester.bind(null, 'POST'),
    put: requester.bind(null, 'PUT'),
    patch: requester.bind(null, 'PATCH'),
    del: requester.bind(null, 'DELETE'),
  };
};
