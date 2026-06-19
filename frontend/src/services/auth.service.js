import api from './api';

const register = (name, mobileNumber, password, role) => {
  return api.post('/auth/register', {
    name,
    mobileNumber,
    password,
    role
  });
};

const login = (mobileNumber, password) => {
  return api.post('/auth/login', {
    mobileNumber,
    password,
  })
  .then((response) => {
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  });
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
