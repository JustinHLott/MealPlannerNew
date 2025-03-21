import axios from 'axios';
import storeValue from './useAsyncStorage';
//const API_KEY = 'AIzaSyAP6fzrfm4-qM7SySLop3SfF0Ec2BFzaMg';
const API_KEY = 'AIzaSyCGPk_F8na-N39UxeZLtFUFLXwiqlq30So';//for mealPlanner

//This saves the email and password to the internet.
async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;

  const response = await axios.post(url, {
    email: email,
    password: password,
    returnSecureToken: true,
  });

  const token = response.data.idToken;
  storeValue(email+'token', token)
  return token;
}

export function createUser(email, password) {
  return authenticate('signUp', email, password);
}

export function login(email, password) {
  return authenticate('signInWithPassword', email, password);
}