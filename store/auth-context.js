import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useState } from 'react';

//This controls the variables used in signing up, logging in and out.
export const AuthContext = createContext({
  token: '',
  isAuthenticated: false,
  authenticate: (token) => {},
  logout: () => {},
  id: 0,
  establishId: (id) => {},
});


function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [theId, setTheId] = useState();

  function authenticate(token) {
    setAuthToken(token);
    AsyncStorage.setItem('token',token);
  }

  function logout() {
    setAuthToken(null);
    AsyncStorage.removeItem('token');
  }

  function establishId(id) {
    setTheId(id);
    AsyncStorage.setItem('id',id);
  }

  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout,
    id: theId,
    establishId: establishId,
  };

  //used in App.js to wrap all so the variables can be used throughout.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;


