import { useState } from 'react';
import { Alert, StyleSheet, View,Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view'

import AuthForm from './AuthForm';
import { GlobalStyles } from '../../constants/styles';
import Footer from '../Footer';
import { useEmail } from '../../store/email-context';

//This goes in the login screen or the sign in screen depending on which option was chosen.
function AuthContent({ isLogin, onAuthenticate }) {
  const navigation = useNavigation();
  const { emailAddress, setEmailAddress } = useEmail();
  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
    confirmEmail: false,
    confirmPassword: false,
  });

  function switchAuthModeHandler() {
    if (isLogin) {
      navigation.replace('Meal Planner Signup');
    } else {
      navigation.replace('Meal Planner Login');
    }
  }

  function submitHandler(credentials) {
    let { email, confirmEmail, password, confirmPassword } = credentials;

    email = email.trim();
    password = password.trim();

    const emailIsValid = email.includes('@','.');
    const passwordIsValid = password.length > 6;
    const emailsAreEqual = email === confirmEmail;
    const passwordsAreEqual = password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      (!isLogin && (!emailsAreEqual || !passwordsAreEqual))
    ) {
      Alert.alert('Invalid input', 'Please check your entered credentials. Email must contain @ symbol and password must be at least 6 characters');
      setCredentialsInvalid({
        email: !emailIsValid,
        confirmEmail: !emailIsValid || !emailsAreEqual,
        password: !passwordIsValid,
        confirmPassword: !passwordIsValid || !passwordsAreEqual,
      });
      return;
    }
    setEmailAddress(email);
    console.log("email:",emailAddress);
    onAuthenticate({ email, password });
  }

  
  return (
    <View style={styles.authContent}>
      <ScrollView
          keyboardShouldPersistTaps="handled"//This makes it so you can click a button while the keyboard is up
        >
          <AuthForm
            isLogin={isLogin}
            onSubmit={submitHandler}
            credentialsInvalid={credentialsInvalid}
          />
          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={switchAuthModeHandler}
            >
              <View>
                <Text style={styles.buttonText}>{isLogin ? 'Create a new user' : 'Log in instead'}</Text>
              </View>
            </Pressable>
          </View>
          
        </ScrollView>

    </View>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  authContent: {
    marginTop: 32,
    marginHorizontal: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: GlobalStyles.colors.primary500,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  buttons: {
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    backgroundColor: GlobalStyles.colors.primary800,
    elevation: 2,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: GlobalStyles.colors.primary500,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: GlobalStyles.colors.primary50,
  },
  textCopyright: {
    color: GlobalStyles.colors.primary50,
    //fontFamily: 'atma',
    fontSize:9,
    paddingHorizontal: 4,
    paddingTop: 24,
    paddingBottom: 0,
    color: GlobalStyles.colors.primary50,
    textAlign: 'right',
  },
});
