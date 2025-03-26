import { useContext, useState, useCallback } from 'react';
import { useFocusEffect } from "@react-navigation/native";

import MealsOutput from '../components/MealsOutput/MealsOutput';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import LoadingOverlay from '../components/UI/LoadingOverlay';
import { MealsContext } from '../store/meals-context';
import { fetchMeals } from '../util/http';
import { useEmail } from '../store/email-context';
import { getValue} from '../util/useAsyncStorage';

function AllMeals() {
  const [isFetching, setIsFetching] = useState(false);
  // const [error, setError] = useState();
  const [meals, setMeals] = useState(null);
  const [firstTime, setFirstTime] = useState(true);
  const { emailAddress, setEmailAddress } = useEmail();
  //let mealsSorted;
  
  const mealsCtx = useContext(MealsContext);

  // if(firstTime){
  //   //This sorts the meals by the date field.
  //   setMeals([...mealsCtx.meals,].sort((a, b) => b.date - a.date));
  //   setFirstTime(false);
  // };
  // useFocusEffect(
  //     useCallback(() => {
  //       setFirstTime(true);
  //       // setIsFetching(true);
  //       // getMeals(); // Fetch meals every time screen is focused
  //       // setIsFetching(false);
  //     }, [])
  //   );

  useFocusEffect(
    
    useCallback(() => {
      console.log("using focus effect");
      setFirstTime(true);
    }, [])
  );

  if(firstTime){
    console.log("using first time");
    getData();
    setFirstTime(false);
    
  }

  async function getData(){
    let allMeals = [];
    try{
      allMeals = await fetchMeals();
      //console.log("AllMeals:",allMeals);
    }catch(error){
      console.error("AllMeals getMeals error:",error)
    }
    let result="";
    try{
      result = await pullGroupChosen()
    }catch(error){
      console.error("catch:",error)
    }
    
    //.then((result)=>{
      console.log("AllMeals groupChosen:",result);
      //if(result instanceof Promise){
      let allTheMeals = [];
      try{
        allMeals.map((meal)=>{
          //console.log("AllMeals mapped group:",meal)
          if(meal.group === result){
            allTheMeals.push(meal);
          }
        })
        console.log("AllMeals allGroups:",allTheMeals);
        //console.log("All meals typeOf:",typeof allGroups)
        if(typeof allTheMeals ==='object'){
          //This sorts the meals by the date field.
          setMeals([...allTheMeals,].sort((a, b) => b.date - a.date));
              

          //console.log("AllMeals meals:",meals);
          }
          
        }catch(error){
          console.log("AllMeals error:",error)
        }
    //})
  }

  async function pullGroupChosen(){
    console.log("Made it to pullgroupchosen");
    console.log("email address:",emailAddress);
    let accountTypeChosen="";
    try{
      accountTypeChosen = await getValue(emailAddress+"groupChosen");
    }catch(error){
      console.error("AllMeals pullGroupChosen error:",error);
    }
    
    console.log("AllMeals pullgroupchosen:", accountTypeChosen);
    setIsFetching(true);
    return accountTypeChosen;
    
  };

  function getGroupId(){
    //blank function needed so that MealsOutput will have the correct number of inputs.
  }
  // if (error && !isFetching) {
  //   return <ErrorOverlay message={error} />;
  // }

  // if (!isFetching) {
  //   return <LoadingOverlay />;
  // }

  return (
    <MealsOutput
      meals={meals}
      fallbackText="No meals found..."
      getGroupId = {getGroupId}
    />
  );
}

export default AllMeals;
