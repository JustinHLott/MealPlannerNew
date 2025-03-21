import { useContext, useState, useCallback } from 'react';
//import { useFocusEffect } from "@react-navigation/native";

import MealsOutput from '../components/MealsOutput/MealsOutput';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import LoadingOverlay from '../components/UI/LoadingOverlay';
import { MealsContext } from '../store/meals-context';
//import { useEmail } from '../store/email-context';
//import { getValue} from '../util/useAsyncStorage';

function AllMeals() {
  // const [isFetching, setIsFetching] = useState(false);
  // const [error, setError] = useState();
  // const [meals, setMeals] = useState(null);
  // const [firstTime, setFirstTime] = useState(false);
  //let mealsSorted;
  
  const mealsCtx = useContext(MealsContext);

  // useFocusEffect(
  //     useCallback(() => {
  //       setFirstTime(true);
  //       // setIsFetching(true);
  //       // getMeals(); // Fetch meals every time screen is focused
  //       // setIsFetching(false);
  //     }, [])
  //   );

  // if(firstTime){
    
  //   const groupUsing = pullGroupChosen()
  //   .then((result)=>{
  //     console.log("AllMeals mealsCtx:",mealsCtx.meals);
  //     //if(result instanceof Promise){
  //     let allGroups = [];
  //     try{
  //       mealsCtx.meals.map((meal)=>{
  //         //console.log("AllMeals mapped group:",meal)
  //         if(meal.group === result){
  //           allGroups.push(meal);
  //         }
  //       })
  //       //console.log("AllMeals allGroups:",allGroups);
  //       //console.log("All meals typeOf:",typeof allGroups)
  //       if(typeof allGroups ==='object'){
        
  //         setMeals([...allGroups,].sort((a, b) => b.date - a.date));
  //         //console.log("AllMeals meals:",meals);
  //         }
  //         setFirstTime(false);
  //       }catch(error){
  //         console.log("AllMeals error:",error)
  //       }
  //   })
    
  // }

  // async function pullGroupChosen(){
  //   //setIsFetching(true);
  //   const accountTypeChosen = await getValue(emailAddress+"groupChosen");
  //   setIsFetching(true);
  //   return accountTypeChosen;
    
  // };

  // if (error && !isFetching) {
  //   return <ErrorOverlay message={error} />;
  // }

  // if (!isFetching) {
  //   return <LoadingOverlay />;
  // }

  return (
    <MealsOutput
      meals={mealsCtx.meals}
      fallbackText="No meals found..."
    />
  );
}

export default AllMeals;
