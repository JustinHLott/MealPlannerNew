import { useContext, useEffect, useState, useCallback } from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import { useIsFocused, useFocusEffect } from "@react-navigation/native";

import MealsOutput from '../components/MealsOutput/MealsOutput';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import LoadingOverlay from '../components/UI/LoadingOverlay';
import { GlobalStyles } from '../constants/styles';
import { MealsContext } from '../store/meals-context';
import { getDateMinusDays } from '../util/date';
import { fetchMeals } from '../util/http';
import IconButtonNoText from '../components/UI/IconButtonNoText';
import Button from '../components/UI/Button';
import { getValue} from '../util/useAsyncStorage';
import { useEmail } from '../store/email-context';

function RecentMeals() {
  //console.log("Makes it to RecentMeals");
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState();
  const [firstDate, setFirstDate] = useState(getSundayOfThisWeek());
  const [recentMeals, setRecentMeals] = useState([]);
  const [firstTime, setFirstTime] = useState(true);
  const [theFallbackText,setTheFallbackText] = useState("No meals found...");
  const [notHidden, setNotHidden] = useState(true);
  const { emailAddress, setEmailAddress } = useEmail();
  const {groupUsing, setGroupUsing} = useEmail();

  const mealsCtx = useContext(MealsContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    async function getMeals() {
      setIsFetching(true);
      setNotHidden(false);
      try {
        const meals = await fetchMeals();

        pullGroupChosen()
        .then((result)=>{
          console.log("RecenetMeals groupChosen:",result);
          console.log("RecenetMeals groupUsing:",groupUsing);
          //if(result instanceof Promise){
          let allGroups = [];

          meals.map((meal)=>{
            
            if(meal.group === result){
              //console.log("RecentMeals mapped group:",meal)
              allGroups.push(meal);
              setNotHidden(true);
            }
          })
          // console.log("RecentMeals allGroups:",allGroups);
          // console.log("RecentMeals typeOf:",typeof allGroups)
          if(typeof allGroups ==='object'){
          
            mealsCtx.setMeals([...allGroups,].sort((a, b) => b.date - a.date));
            setRecentMeals([...allGroups,].sort((a, b) => b.date - a.date));
            //console.log("RecentMeals meals:",mealsCtx.meals);
          }
        })
      } catch (error) {
        console.log(error)
        setError('Could not fetch meals!');
      }
      setIsFetching(false);
    }

    getMeals();
  }, []);

  async function pullGroupChosen(){
    //console.log("RecentMeals email:",emailAddress)
    const accountTypeChosen = await getValue(emailAddress+"groupChosen");
    return accountTypeChosen?accountTypeChosen:groupUsing;
  };

  if(!firstDate){
    //setFirstDate(new Date());
    const today = getSundayOfThisWeek();
    //console.log("today",today)
    setFirstDate(today);
  }
  
  function getSundayOfThisWeek(){
    const today = getDateMinusDays(new Date(),1);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    //console.log("dayOfWeek",dayOfWeek);
    const diff = today.getDate() - dayOfWeek; // Calculate the difference to Sunday
    //console.log("Diff",diff);
    return new Date(today.setDate(diff));
  };

  //PREVIOUS,CURRENT,NEXT////////////////////////////////////////////////////////
  function previous(){
    setFirstTime(true);
    const mealsSorted = [...mealsCtx.meals,].sort((a, b) => a.date - b.date);
    const thisGroupOfMeals = mealsSorted.filter((meal) => {
      let firstDay = getDateMinusDays(firstDate, 7);
      let datePlus7 = getDateMinusDays(firstDay, -6);
      let theMeals = (meal.date >= firstDay && meal.date <= datePlus7)
   
      //console.log("RecentMeals 1st:",firstDay,"End:",datePlus7)
      return theMeals;
    });
    //console.log("RecentMeals Meals this week",thisGroupOfMeals.length)
    if(thisGroupOfMeals.length>0){
      const today = getDateMinusDays(firstDate,7);
      // const today = getSundayOfThisWeek();
      setFirstDate(today);
    }
  }

  function currentWeek(){
    setFirstTime(true);
    //console.log(mealsCtx.dates)
    //const today = getDateMinusDays(new Date(),1);
    const today = getSundayOfThisWeek();
    console.log("today",today)
    setFirstDate(today);
  }
  function next(){
    setFirstTime(true);
    const mealsSorted = [...mealsCtx.meals,].sort((a, b) => a.date - b.date);
    const thisGroupOfMeals = mealsSorted.filter((meal) => {
      let firstDay = getDateMinusDays(firstDate, -7);
      let datePlus7 = getDateMinusDays(firstDay, -7);
      let theMeals = (meal.date >= firstDay && meal.date <= datePlus7)
   
      return theMeals;
    });
    //console.log(thisGroupOfMeals)
    if(thisGroupOfMeals.length>0){
      const today = getDateMinusDays(firstDate,-7);
      //console.log("next Sunday: ",today)
      setFirstDate(today);
    }
  }
  //PREVIOUS,CURRENT,NEXT////////////////////////////////////////////////////////


  if(firstTime===true){
    console.log("RecentMeals firstTime")
    setFirstTime(false);
    getMeals();
  }


  async function getMeals(){
    //console.log("RecentMeals isFocused")
    setNotHidden(false);
    const meals = await fetchMeals();
    const groupUsing = pullGroupChosen()
    .then((result)=>{
      console.log("RecenetMeals groupChosen:",result);
      //if(result instanceof Promise){
      let allGroups = [];

      meals.map((meal)=>{
        //console.log("RecentMeals mapped group:",meal.group)
        if(meal.group === result){
          
          allGroups.push(meal);
        }
      })
      // console.log("RecentMeals allGroups:",allGroups);
      // console.log("RecentMeals typeOf:",typeof allGroups)
      if(typeof allGroups ==='object'){
      
        mealsCtx.setMeals(allGroups);
        const mealsSorted = [...allGroups,].sort((a, b) => a.date - b.date);
        console.log("RecentMeals meals:",mealsSorted);
        const recentMeals1 = mealsSorted.filter((meal) => {
          let firstDay = new Date(firstDate);
          //console.log("Recent Meals firstDay:",firstDay);
          let datePlus7 = getDateMinusDays(firstDay, -6);
          //console.log("Recent Meals dayPlus7:",datePlus7);
          let theMeals = (meal.date >= firstDay && meal.date <= datePlus7)
          if(!theMeals){
            setNotHidden(false);
          }else{
            setNotHidden(true);
          }
          //setTheFallbackText('No meals registered for dates ' + firstDay.toISOString().slice(0, 10) + ' to ' + datePlus7.toISOString().slice(0, 10));
          //console.log("RecentMeals meals",theMeals)
          return theMeals;
        });
        setRecentMeals(recentMeals1);
      }
    })
  }
    


  useFocusEffect(
    useCallback(() => {
      setFirstTime(true);
      // setIsFetching(true);
      // getMeals(); // Fetch meals every time screen is focused
      // setIsFetching(false);
    }, [])
  );

  function makeNotHidden(TF){
    setNotHidden(TF);
  }
  if (error && !isFetching) {
    return <ErrorOverlay message={error} />;
  }

  if (isFetching) {
    return <LoadingOverlay />;
  }
  
  return (
    <View style={styles.container}>
      
      <View style={styles.buttonContainer}>
        <IconButtonNoText
            icon="arrow-back-circle-outline"
            color={GlobalStyles.colors.primary50}
            size={50}
            onPress={previous}
            forLongPress={()=>{Alert.alert("Function of Button","View previous week's meals")}}
          />
          <Button onPress={currentWeek}>Click for Current Week</Button>
          <IconButtonNoText
            icon="arrow-forward-circle-outline"
            color={GlobalStyles.colors.primary50}
            size={50}
            onPress={next}
            forLongPress={()=>{Alert.alert("Function of Button","View previous week's meals")}}
          />
      </View>

      <MealsOutput
        meals={recentMeals}
        fallbackText={theFallbackText}
        //makeNotHidden={makeNotHidden}
      />
    </View>
    
  );
}

export default RecentMeals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  buttonContainer:{
    flexDirection: 'row',
    alignItems: 'center',//vertical alignment
    justifyContent: 'center',
  }

});
