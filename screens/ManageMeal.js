import { useContext, useLayoutEffect, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view'
import axios from 'axios';
const BACKEND_URL =
  'https://justinhlottcapstone-default-rtdb.firebaseio.com';

//import MealForm from '../components/ManageMeal/MealForm';
import MealForm2 from '../components/ManageMeal/MealForm2';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import IconButton from '../components/UI/IconButton';
import LoadingOverlay from '../components/UI/LoadingOverlay';
import { GlobalStyles } from '../constants/styles';
import { MealsContext } from '../store/meals-context';
import { ListsContext } from '../store/lists-context';
import { storeMeal, deleteMeal, updateMealRaw } from '../util/http';//updateMeal
import { storeList, deleteList, updateList } from '../util/http-list';
//import MealGroceries from '../components/MealsOutput/MealGroceries';
import { getDateMinusDays } from "../util/date";
import { useEmail } from '../store/email-context';
import Footer from '../components/Footer';

let theID ="";

function ManageMeal({ route, navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  //const [newGroceryItem,setNewGroceryItem] = useState({});
  const [theMeal,setTheMeal] = useState({});
  const [updatedGroceryList,setUpdatedGroceryList] = useState([]);
  const {groupUsing, setGroupUsing} = useEmail();

  const mealsCtx = useContext(MealsContext);
  const listsCtx = useContext(ListsContext);

  const editedMealId = route.params?.mealId;
  const isEditing = !!editedMealId;

  //let newGroceryList = [];
  useEffect(()=>{
    if(editedMealId){
      setTheMeal(mealsCtx.meals.find(
      (meal) => meal.id === editedMealId
    ));
    }
  },[]);

  useEffect(()=>{
    if(editedMealId){
      setTheMeal(mealsCtx.meals.find(
      (meal) => meal.id === editedMealId
    ));
    }
  },[mealsCtx.meals,deleteMealHandler])
  

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Meal' : 'Add Meal',
    });
  }, [navigation, isEditing]);

  async function deleteMealHandler() {
    setIsSubmitting(true);
    //delete the grocery items associated with the meal
    try {
      const currentMeal = mealsCtx.meals.find((meal) => meal.id === editedMealId);
      currentMeal.groceryItems.forEach((item)=>{
        //console.log("Grocery items delete:",item);
        //deletes from context
        deleteFromGroceryCtx(item.thisId);
        //deletes from firebase
        deleteList(item.thisId);
      })
      if(listsCtx.lists.length === 0){
        listsCtx.setLists([]);
      }
      //navigation.goBack();
    } catch (error) {
      setError('Could not delete grocery item - please try again later!');
      setIsSubmitting(false);
    }
    //delete the meal
    try {
      await deleteMeal(editedMealId);
      mealsCtx.deleteMeal(editedMealId);
      navigation.goBack();
    } catch (error) {
      setError('Could not delete meal - please try again later!');
      setIsSubmitting(false);
    }
  }

  function deleteFromGroceryCtx(thisId){
    // console.log("MealForm2 before delete",listsCtx.lists)
    // console.log("MealForm2 thisId",thisId)
    if(listsCtx.lists.find(
      (theList) => thisId === theList.id?theList.id:theList.thisId
    )){
      const updatedGroceries1 = listsCtx.lists.filter(grocery => grocery.thisId !== thisId);
      const updatedGroceries = updatedGroceries1.filter(grocery => grocery.id !== thisId);
      listsCtx.setLists(updatedGroceries);
    }else{
      console.log("ManageMeal, no selectedMeal")
    }
    // console.log("MealForm2 after delete",updatedGroceries);
  }
  // function first(updatedGrocery){
  //   setNewItemId(storeList(updatedGrocery));
  //   console.log("ManageMeals newItemId: ", newItemId)
  //   console.log("first");
  // }
  // function second(updatedGrocery){
  //   setNewGroceryItem({
  //     ...updatedGrocery,id: newItemId, thisId: newItemId
  //   });
  //   console.log("second");
  //   console.log("ManageMeal add groceryItem: ",newGroceryItem)
  // }
  // function third(newGroceryItem){
  //   console.log("ManageMeal add groceryItem: ",newGroceryItem)
  //   listsCtx.addList(newGroceryItem);
  //   console.log("third");
  // }

  // const runFunctionsInOrder = useCallback((updatedGrocery)=>{
  //   first(updatedGrocery);
  //   second(updatedGrocery);
  //   third(newGroceryItem);
  // },[]);

function updateCtxList(updatedGrocery,id){
  console.log("ManageMeal updateCtxlist:",updatedGrocery,id);
  listsCtx.updateList(id,updatedGrocery);
}

  async function addCtxList(updatedGrocery,id){
    try{
      console.log("ManageMeal addCtxlist")
      console.log("ManageMeals newItemId2: ", id)
      const groceryItem={
        thisId: id,
        checkedOff: updatedGrocery.checkedOff,
        mealDesc: updatedGrocery.mealDesc,
        mealId: updatedGrocery.mealId,
        description: updatedGrocery.description,
        qty: updatedGrocery.qty
      };
      console.log("ManageMeals groceryItem: ", groceryItem)
      //this adds the grocery item to the groceryItems for the meal
      listsCtx.addList(groceryItem);
    }catch(error){
      console.error("ManageMeal addCtxList Error:", error);
    }
  }
  
  function deleteCtxList(groceryItem){
    console.log("ManageMeal delete groceryItem: ",groceryItem)
    const currentMeal = mealsCtx.meals.find((meal) => meal.id === editedMealId)
    if(currentMeal){
      const updatedGroceries1 = currentMeal.groceryitems.filter(grocery => grocery.thisId !== groceryItem.thisId);
      const updatedGroceries = updatedGroceries1.filter(grocery => grocery.id !== groceryItem.id);

      console.log("ManageMeals delete groceryItem meal:",
        {
          id: currentMeal.id,
          date: currentMeal.date,
          groceryItems: updatedGroceries
        });
      //update the state for the page.
      setTheMeal({
        id: currentMeal.id,
        date: currentMeal.date,
        description: currentMeal.description,
        group: groupUsing?groupUsing:currentMeal.group,
        groceryItems: updatedGroceries
      })
    }
    //update the groceries ctx list
    listsCtx.deleteList(groceryItem);
  }

  function addCtxMeal(updatedMeal,mealId){
    console.log("ManageMeal addCtxMeal: ",updatedMeal)
    //updates state for current sheet
    setTheMeal(updatedMeal);
    //This adds the meal to the Context in the app
    mealsCtx.addMeal({ ...updatedMeal, id: mealId });
  }

  async function confirmHandler(mealData, noGroceries) {
    //let noGroceries = true;
    console.log("Makes it to confirmHandler in ManageMeals")
    //console.log(mealData);
    setIsSubmitting(true);
    try {
      if (isEditing) {
        console.log("ManageMeal updatinging.  noGroceries:",noGroceries);
        //array.length = 0;//This resets the grocery array.
        //setNewGroceryItem([]);
        updateMeal(mealData.id, mealData, theMeal, noGroceries);
        //mealsCtx.updateMeal(mealData.id, mealData);
        //maybe delete then add again instead of updating the meal?
        //also must add meal to ctx and add groceries to ctx.
        navigation.goBack();
      } else {
        console.log("ManageMeal adding")
        const id = await storeMeal(mealData,addCtxList,addCtxMeal);//This adds the meal to firebase
        console.log("ManageMeal finishes adding")
        theID = id;
        mealsCtx.dates.push(mealData.date);
        console.log("Made it to savePromises")
        //await Promise.all(savePromises);
        navigation.goBack();
      }
      
    } catch (error) {
      console.log("ManageMeal save error:",error)
      //setError('Could not save data - please try again later!',error);
      setIsSubmitting(false);
    }
  }

  //UPDATE/////////////////////////////////////////////////////////

  async function updateGroceryItem(item,mealIds,mealData){
    const item2={
      ...item, mealId: mealIds, mealDesc: mealData.description, group: groupUsing?groupUsing:mealData.group
    }
    console.log("http updateGroceryItem update/add:", item2);
    //the next lines of code are for grocery items that do exist already.
    if("thisId" in item ||item.id&&item.id!==""){
      try{
        console.log("http updateGroceryItem update grocery item:",item.thisId?item.thisId:item.id)
        //update the item in constext (in case it changed).
        updateCtxList(item2,item.thisId?item.thisId:item.id);
        //update the grocery item in firebase (in case it changed).
        updateList(item.thisId?item.thisId:item.id,item2);
        //add grocery item to state grocery list
        //setUpdatedGroceryList([...updatedGroceryList,item2]);
        // //updates meal in context, firebase & page state
        // updateCtxMeal(item2,item.thisId?item.thisId:item.id,mealIds,mealData);
        updateCtxMeal(mealIds,mealData,item2);
        //return the id that it already has.
        return item.thisId?item.thisId:item.id;
        //theResponse = item.thisId?item.thisId:item.id;
        //return theResponse;
      }catch(error){
        console.log("http updateGroceryItem error:",error);
      } 
    //the next lines of code are for newly created grocery items that do exist already but don't have a thisId yet.   
    }else{
      //add new grocery item
  
          // Save each item to Firebase using Axios
          fetchDataWithRetry(item2, 5, 2000)
          .then((response)=>{
            if(response){
              console.log("http updateGroceryItem new groceryid: ",response);
              //Add the new grocery id to the groceryData
              let updatedGrocery = {
                ...item2, thisId: response,
              };
              //this function is from ManageMeals and it adds the updated grocery list to ctx.
              addCtxList(updatedGrocery,response);
              //add grocery item to state grocery list
              //setUpdatedGroceryList([...updatedGroceryList,updatedGrocery]);
              //update firebase with thisId but don't await
              axios.put(BACKEND_URL + `/grocery/${response}.json`, updatedGrocery);
              // //updates meal in context, firebase & page state
              // updateCtxMeal(updatedGrocery,response,mealIds,mealData);
              updateCtxMeal(mealIds,mealData,updatedGrocery);
              return response;
            }else{
              console.log("http updateGroceryItem new !groceryid: ",response);
              return [];
            }
          })
      }
    //return theResponse;
  }
  
  const fetchDataWithRetry = async (item2, maxAttempts, delay) => {
    let attempt = 0;
  
    while (attempt < maxAttempts) {
      try {
        console.log(`Attempt ${attempt + 1}...`);
        const response = await axios.post(BACKEND_URL + '/grocery.json', item2);
        console.log("Data received:", response.data);
        return response.data.name; // Exit loop on success
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        attempt++;
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        }
      }
    }
  
    throw new Error("Max retry attempts reached. Request failed.");
  };
  
  
  function updateMeal(mealIds, mealData, previousMealData,  noGroceries) {
    let newGroceryList=[];
    let groceryItem1;
    let groceryItem2;
    let groceryItem3;
    console.log("ManageMeal noGroceries",noGroceries);
    console.log("ManageMeal mealData",mealData);
    console.log("ManageMeal previousMealData",previousMealData);
    //if there are grocery items on the new meal
    if(noGroceries===false){
      //ADDITIONS///////////////////////////////////////////////////////////////////////////
      //add new grocery items
      mealData.groceryItems.forEach((item,index)=>{
        //loop through all of the new grocery items
        console.log("ManageMeal updateMeal item:",typeof item.thisId);
        //console.log("http updateMeal item.id:",item.thisId?item.thisId:item.id)
        
        //if there are no grocery items on the previous meal
        if(!previousMealData.groceryItems){
        //if(previousMealData.groceryItems.length===0){
          try{
            //add all grocery items as new.
            console.log("ManageMeal !previousMealData.groceryItems:",previousMealData.groceryItems);
            //let updatedGroceryid;
  
            //get a newId for the new grocery item
            const response = updateGroceryItem(item,mealIds,mealData)
              //.then(response=>{
                let theId=response;
                console.log("ManageMeal updateMeal !grocId:",theId)
                console.log("ManageMeal updateMeal updatedGroceryid:",response)
                //Add new thisId to groceryData.
                groceryItem1 = {
                  ...item,thisId: theId
                }
                groceryItem1 = {
                  ...groceryItem1,mealId: mealIds
                }
                groceryItem1 = {
                  ...groceryItem1,group: groupUsing?groupUsing:mealData.group
                }
                //Add new roceryData to new array
                newGroceryList.push(groceryItem1);
              //})
          }catch(error){
            console.log("ManageMeal !previousMealData.groceryItems error:",error);
          }
        }else{//if the previous meal has grocery items
          //update all matching item Ids to grocery list
          console.log("ManageMeal previousMealData.groceryItems:",previousMealData.groceryItems);
          //if it has a thisId or an id...
          if("thisId" in item ||item.id&&item.id!==""){//if ("thisId" in item)
            //if the grocery itemId is found on both grocery lists keep it
            if(previousMealData.groceryItems.find(
              (meal) => meal.thisId?meal.thisId:meal.id === item.thisId?item.thisId:item.id
            )){console.log("ManageMeal found defined Item:",item);
              try{
                const response = updateGroceryItem(item,mealIds,mealData)
                //Add thisId to groceryData (if it already exits it will just write over the top of it).
                groceryItem2 = {
                  ...item,thisId: item.thisId?item.thisId:item.id
                }
                groceryItem2 = {
                  ...groceryItem2,mealId: mealIds
                }
                groceryItem2 = {
                  ...groceryItem2,group: groupUsing?groupUsing:mealData.group
                }
                //Add updated groceryData to new array
                newGroceryList.push(groceryItem2);
              }catch(error){
                console.log("ManageMeal previousMealData.groceryItems found:",error)
              }
            };
          }else{//if itemId is not there
            //if new grocery item has no id then add it to new list
            console.log("ManageMeal found undefined item:",item)
             //get a newId
              const response = updateGroceryItem(item,mealIds,mealData);
              //.then(response=>{
                let theId="";
                if(response){
                  if(response.length > 20){
                    theId=response._j;
                  }else{
                    theId=response;
                  }
                }
                
                console.log("ManageMeal updateMeal !!grocId:",theId)
                //Add thisId to groceryData
                groceryItem3 = {
                  ...item,thisId: theId
                }
                groceryItem3 = {
                  ...groceryItem3,mealId: mealIds
                }
                groceryItem3 = {
                  ...groceryItem3,group: groupUsing?groupUsing:mealData.group
                }
                //Add groceryData to new array
                newGroceryList.push(groceryItem3);
              //});
          }
        }
      });
      //DELETIONS////////////////////////////////////////////////////////////////////////
      //if there are no grocery items on the previous meal
      try{
        if(previousMealData.groceryItems.length > 0){
          //delete old grocery items (in previous meal but not in new meal).
          previousMealData.groceryItems.forEach((item,index)=>{
              if(!mealData.groceryItems.find(
                (meal) => meal.thisId?meal.thisId:meal.id === item.thisId?item.thisId:item.id
              )){
                console.log("ManageMeal updateMeal deleteId: ", item.thisId?item.thisId:item.id);
                //delete old grocery item from context
                deleteCtxList(item);
                //delete old grocery item from firebase
                deleteList(item.thisId?item.thisId:item.id);
              };
            });
          }
      }catch(error){
        console.log(error);
      }
    //if there is no grocery list...
    }else{
      console.log("ManageMeal made it to no groceries")
      updateCtxMeal(mealIds,mealData,"noGroceryItem");
    }
    
    console.log("ManageMeal updateMeal new List:",newGroceryList);
    //updateCtxMeal(newGroceryList,"1",mealIds,mealData);
    return newGroceryList;
  }

  async function updateCtxMeal(mealId,mealData,newGroceryItem){
    try{
      console.log("ManageMeal updateCtxMeal:",mealData);
      // console.log("ManageMeal updateCtxMeal md:",mealData.groceryItems);
      // console.log("ManageMeal updatedGroceryList", newGroceryItem)

      let groceryList=[]
      if(newGroceryItem !== "noGroceryItem"){
        mealData.groceryItems.forEach((item)=>{
          //if this is the new grocery item add it instead of the the version with no thisId.
          if(item.description===newGroceryItem.description){
            //setUpdatedGroceryList(newGroceryItem);
            groceryList.push(newGroceryItem);
          //otherwise add all the updated grocery items to the grocery list
          }else{
            groceryList.push(item);
          }
        })
      }
      
      //this creates an updated meal with the updated grocery list.
      let currentMeal2
      
      //Add one day to the date so that it sits one day ahead in firebase.
      const newDate = getDateMinusDays(mealData.date,-1);
      console.log("ManageMeals updateCtxMeal date:",newDate);
      currentMeal2 = {
        id: mealData.id,
        date: newDate,
        description: mealData.description,
        group: groupUsing?groupUsing:mealData.group,
        groceryItems: groceryList
      };
      //updates the context for meals with the updated meal info
      mealsCtx.updateMeal(mealId,currentMeal2);
      //updates state for current sheet
      setTheMeal(currentMeal2);
      //updates the meal in firebase
      await updateMealRaw(mealId,currentMeal2);
      // axios.put(BACKEND_URL + `/meals3/${mealId}.json`, currentMeal2);
      console.log("ManageMeal updateCtxMeal firebase:",currentMeal2);
      //}
    }catch(error){
      console.error("ManageMeal addCtxList Error:", error);
    }
  }
  //UPDATE/////////////////////////////////////////////////////////
  

  function getLatestDate(){
    let mostRecentMealDate=getDateMinusDays(new Date(),1);
    if(mealsCtx.meals.length>0){
      mostRecentMealDate = mealsCtx.meals.reduce((meal, latest) => new Date(meal.date) > new Date(latest.date) ? meal : latest).date;
    }else{
      mostRecentMealDate =  new Date();
    }
    //Add one day to the most recent date
    //const date = new Date();
    const date = new Date(mostRecentMealDate);
    date.setDate(date.getDate() + 1);
    return mostRecentMealDate;
  }

  if (error && !isSubmitting) {
    return <ErrorOverlay message={error} />;
  }

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"//This makes it so you can click a button while the keyboard is up
      >
        <MealForm2
          initialMeal={theMeal}
          defaultDate={getLatestDate()}
          onSubmit={confirmHandler}
          submitButtonLabel={isEditing ? 'Update' : 'Save Meal'}
        />
        {/*This delete the meal*/}
         {isEditing && (
          <View style={styles.deleteContainer}>
            <IconButton
              icon="trash"
              color={GlobalStyles.colors.error500}
              size={36}
              onPress={deleteMealHandler}
            />
          </View>
        )}
        
      </ScrollView>
      <Footer/>
    </View>
  );
}

export default ManageMeal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: GlobalStyles.colors.primary800,
  },
  deleteContainer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: GlobalStyles.colors.primary200,
    alignItems: 'center',
  },
});
