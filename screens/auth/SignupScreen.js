import { useContext, useState } from 'react';
import { Alert,ActivityIndicator,View,Text,StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthContent from '../../components/Auth/AuthContent';
import { AuthContext } from '../../store/auth-context';
import { createUser } from '../../util/auth';
import { GlobalStyles } from '../../constants/styles';
import { storeGroup, updateGroup } from './Settings';
import { useEmail } from '../../store/email-context';
//import {storeValue} from '../../util/useAsyncStorage';
import Footer from '../../components/Footer';

//screen to sign up for the first time
function SignupScreen({navigation}) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { emailAddress, setEmailAddress } = useEmail();
  const {groupUsing, setGroupUsing} = useEmail();
  const {accountType, setAccountType} = useEmail();

  const authCtx = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      
      const token = await createUser(email, password);
      console.log('create');
      
      try{
        authCtx.authenticate(token)
        createNewGroup(email);
      }catch(error){
        console.log("SignupScreen createNewGroup:",error)
      }
      setIsAuthenticating(false);
      
    } catch (error) {
      Alert.alert(
        'Authentication failed',
        'Could not create user, please check your input and try again later.'
      );
      navigation.navigate("Meal Planner Login");
    }
  }

  async function createNewGroup(email){
    console.log("SignupScreen createNewGroup");
    try{
      setEmailAddress(email);
      const newGroup = {
          group: email,
          email: email,
      }
      const id = await storeGroup(newGroup);
      const newGroup2={...newGroup,id: id, groupId: id};
      console.log("SignupScreen createNewGroup:",newGroup2);
      try {
        console.log("Value not stored yet! id:", id);
        updateGroup(id, newGroup2);
      
        await AsyncStorage.setItem(email+"accountTypeChosen","personal");
        await AsyncStorage.setItem(email+"groupChosen",id);
        //set the group in context
        setGroupUsing(id);
        setAccountType('personal');
        console.log("Value stored successfully! groupUsing:", groupUsing);
      } catch (error) {
        console.error("SignupScreen Error storing value:", error);
      }
      //storeValue(emailAddress+"accountTypeChosen","personal");
      //await storeValue(emailAddress+"groupChosen",id);
    }catch(error){
      console.log("SignupScreen createGroup error:",error);
    }
    
  }

  if (isAuthenticating) {
    
    return (
      <View style={styles.rootContainer}>
        <View styles={{padding:50, flex:1}}>
          <View styles={{marginBottom: 100}}>
            <Text style={styles.message}>"Creating User..."</Text>
          </View>
          
          <ActivityIndicator size="large" />
        </View>
        
        <View style={styles.footerView}>
          <Footer/>
        </View>
        
      </View>
    );
  }

  return (
    <View style={styles.topContainer}>
      <View style={styles.container2}>
        <AuthContent isLogin={false} onAuthenticate={signupHandler} />
      </View>
      <View style={styles.footerView}>
        <Footer/>
      </View>
    </View>
  );
}

export default SignupScreen;

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    //paddingHorizontal: 20,
  },
  container2:{
    flex: 1,
  },
  rootContainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    paddingHorizontal: 32,
    marginTop:100,
    marginBottom: 100,
  },
  footerView:{
    marginRight:32,
    marginBottom:5,
    marginTop:100,
  },
  message: {
    fontSize: 16,
    marginBottom: 12,
    color: GlobalStyles.colors.primary50,
  },
});
