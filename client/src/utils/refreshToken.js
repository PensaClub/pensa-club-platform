import { jwtDecode } from 'jwt-decode';

const apiUrl = process.env.REACT_APP_API_URL;

export async function refreshToken(authInfo) {
  const decodedToken = jwtDecode(authInfo.token);
  const tokenExpiresIn = new Date(decodedToken.exp * 1000) - new Date();

  if (tokenExpiresIn < 1 * 60 * 1000) {
    const response = await fetch(`${apiUrl}/token/refresh`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      const newAuth = {
        ...authInfo,
        token: result.token,
      };

      localStorage.setItem('auth', JSON.stringify(newAuth));
      return newAuth.token;
    } else {
      localStorage.clear();
      return null;
    }
  } else {
    return authInfo.token;
  }
}
