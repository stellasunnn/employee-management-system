import api from './base';

const API_URL = '/auth'; // Adjust this to your backend URL

export const login = async ({ username, password }: { username: string; password: string }) => {
  try {
    const response = await api.post(`${API_URL}/login`, { username, password });
    console.log('response', response);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async ({
  token,
  username,
  email,
  password,
}: {
  token: string;
  username: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post(`${API_URL}/register`, { token, username, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loadUser = async (token: string) => {
  try {
    const response = await api.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const logout = async () => {
//   try {
//     const response = await axios.post(`${API_URL}/logout`);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
