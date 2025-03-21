import { useState } from 'react';
import { StyleSheet, View,Text,Pressable,Image,Linking } from 'react-native';

//import Button from '../ui/Button';
import Input from './Input';
import { GlobalStyles } from '../../constants/styles';

//This goes in the AuthContent.  Includes all the input boxes for signin/login
function AuthForm({ isLogin, onSubmit, credentialsInvalid }) {
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredConfirmEmail, setEnteredConfirmEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [enteredConfirmPassword, setEnteredConfirmPassword] = useState('');

  const {
    email: emailIsInvalid,
    confirmEmail: emailsDontMatch,
    password: passwordIsInvalid,
    confirmPassword: passwordsDontMatch,
  } = credentialsInvalid;

  function updateInputValueHandler(inputType, enteredValue) {
    switch (inputType) {
      case 'email':
        setEnteredEmail(enteredValue);
        break;
      case 'confirmEmail':
        setEnteredConfirmEmail(enteredValue);
        break;
      case 'password':
        setEnteredPassword(enteredValue);
        break;
      case 'confirmPassword':
        setEnteredConfirmPassword(enteredValue);
        break;
    }
  }

  function submitHandler() {
    onSubmit({
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
      confirmPassword: enteredConfirmPassword,
    });
  }

  return (
    <View >
      <View>
        <Image source={require('../../assets/images/paul-rogers-FlYgsQGoxhA-unsplash.jpg')} style={styles.image}/>
        <Text style={styles.textPhoto}>Photo at Unsplash by{' '} 
          <Pressable onPress={() => Linking.openURL('https://unsplash.com/@progers?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash')} style={{marginTop:7}}>
            <Text style={{ color: 'yellow', textDecorationLine: 'underline', fontSize: 9}}>
              Paul Rogers
            </Text>
          </Pressable>
        </Text>
        <Input
          label="Email Address"
          onUpdateValue={updateInputValueHandler.bind(this, 'email')}
          value={enteredEmail}
          keyboardType="email-address"
          isInvalid={emailIsInvalid}
          
        />
        {!isLogin && (
          <Input
            label="Confirm Email Address"
            onUpdateValue={updateInputValueHandler.bind(this, 'confirmEmail')}
            value={enteredConfirmEmail}
            keyboardType="email-address"
            isInvalid={emailsDontMatch}

          />
        )}
        <Input
          label="Password"
          onUpdateValue={updateInputValueHandler.bind(this, 'password')}
          secure
          value={enteredPassword}
          isInvalid={passwordIsInvalid}
          
        />
        {!isLogin && (
          <Input
            label="Confirm Password"
            onUpdateValue={updateInputValueHandler.bind(
              this,
              'confirmPassword'
            )}
            secure
            value={enteredConfirmPassword}
            isInvalid={passwordsDontMatch}

          />
        )}
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={submitHandler}
          >
            <Text style={styles.text}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default AuthForm;

const styles = StyleSheet.create({
  buttons: {
    marginTop: 12,
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
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    color: GlobalStyles.colors.primary50,
  },
  textPhoto: {
    color: GlobalStyles.colors.primary50,
    //fontFamily: 'atma',
    fontSize:9,
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 5,
  },
  image:{
    height: 199,
    width: 300,
    marginTop: 10,
    marginLeft:8,
    borderRadius: 4,
  },
});
