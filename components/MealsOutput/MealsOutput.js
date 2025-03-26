import {useContext, useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import MealsList from './MealsList';
import Footer from '../Footer';
import { fetchGroupId } from '../../util/http';
import { useEmail } from '../../store/email-context';
//import { MealsContext } from '../../store/meals-context';

 function MealsOutput({ meals, fallbackText, getGroupId }) {
  const [firstTime,setFirstTime] = useState(true);
  const { emailAddress, setEmailAddress } = useEmail();
  // console.log("Made it to MealsOutput");
  // console.log(meals);
  
  let content = <Text style={styles.infoText}>{fallbackText}</Text>;

  if(meals){
    if (meals.length > 0) {
      //console.log(meals)
      content = <MealsList meals={meals} />;
    }
  }else{
    
  }
  
  if(firstTime===true){
    console.log("MealsOutput email:",emailAddress)
    getGroupId();//function located in Http folder
    setFirstTime(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        {content}
      </View>
      
      <Footer/>
    </View>
  );
}

export default MealsOutput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  container2:{
    flex: 1,
  },
  infoText: {
    color: GlobalStyles.colors.primary50,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});
