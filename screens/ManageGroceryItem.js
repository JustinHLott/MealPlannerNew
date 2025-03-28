import { useContext, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';//makes page scroll when keyboard is up so you can see under it.
import { useFocusEffect } from "@react-navigation/native";

import GroceryForm from '../components/ManageMeal/GroceryForm';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import IconButton from '../components/UI/IconButton';
import LoadingOverlay from '../components/UI/LoadingOverlay';
import { GlobalStyles } from '../constants/styles';
import { ListsContext } from '../store/lists-context';
import { MealsContext } from '../store/meals-context';
import { storeList, updateList, deleteList } from '../util/http-list';
import { updateMealRaw } from '../util/http';
import Footer from '../components/Footer';
import { getValue} from '../util/useAsyncStorage';
import { useEmail } from '../store/email-context';

function ManageGroceryItem({ route, navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [groceryItem, setGroceryItem] = useState(route.params?.item);
  const [firstTime, setFirstTime] = useState(false);
  const [group, setGroup] = useState(null);
  const { emailAddress, setEmailAddress } = useEmail();
  const {groupUsing, setGroupUsing} = useEmail();

  const groceriesCtx = useContext(ListsContext);
  const mealsCtx = useContext(MealsContext);  

  const editedGroceryId = route.params?.groceryId;
  let meal = route.params?.meal;
  
  useFocusEffect(
      useCallback(() => {
        setFirstTime(true);
      }, [])
    );

  if(firstTime){
    pullGroupChosen()
    .then((result)=>{
      try{
        setGroup(result);
        setFirstTime(false);
      }catch(error){
        console.log("ManageGroceryItem useFocusEffect error:",error)
      }
    })
  };

  async function pullGroupChosen(){
    const accountTypeChosen = await getValue(emailAddress+"groupChosen");
    return accountTypeChosen?accountTypeChosen:groupUsing;
  };

  useLayoutEffect(() => {
    if(!groceryItem){
      setGroceryItem("No grocery item");
    }else{
      if(!groceryItem.qty){
        setGroceryItem(groceriesCtx.lists.find(
          (list) => list.id?list.id:list.thisId === editedGroceryId
        ));
      }
    }
    if(!meal){
      meal = "No meal"
    }else{
      if(!meal.date){
        meal = mealsCtx.meals.find(
          (meal) => meal.id === groceryItem.mealId
        );
      }
    }
    
  }, [editedGroceryId]);

  const isEditing = !!editedGroceryId;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Grocery List' : 'Add Grocery List',
    });
  }, [navigation, isEditing]);

  //DELETING/////////////////////////////////////////////////////
  function deleteFromGroceryCtx(thisId){
    //console.log("ManageGroceryItem before delete",groceriesCtx.lists)
    const updatedGroceries1 = groceriesCtx.lists.filter(grocery => grocery.thisId !== thisId);
    const updatedGroceries = updatedGroceries1.filter(grocery => grocery.id !== thisId);
    groceriesCtx.setLists(updatedGroceries);
    //console.log("ManageGroceryItem after delete",updatedGroceries);
  }
  //DELETING/////////////////////////////////////////////////////

async function deleteGroceryHandler() {
  setIsSubmitting(true);
  try {
    //console.log("ManageGroceryItem deleteGroceryHandler")
    if(editedGroceryId){
      //console.log("ManageGroceryItem id: ",editedGroceryId)
      //delete grocery item from firebase http
      await deleteList(editedGroceryId);

      //delete grocery item from grocery ctx
      deleteFromGroceryCtx(editedGroceryId)
      //console.log("ManageGroceryItem groceryItem: ",groceryItem);

      //update mealsCtx
      if(groceryItem.mealId){

        const meal3 = mealsCtx.meals.find(
          (meal) => meal.id === groceryItem.mealId
        );

        if(meal3){
          //console.log("ManageGroceryItem selectedMeal",meal3)
          await createMealWithoutGroceryItem(meal3,editedGroceryId);
          navigation.goBack();
        }else{
          console.log("ManageGroceryItem no id");
          navigation.goBack();
        }
      }else{
        console.log("ManageGroceryItem no mealId");
        navigation.goBack();
      }
    }else{
      console.log("ManageGroceryItem no editedGroceryId");
    }
  } catch (error) {
    console.log("Error:",error)
    setError('Could not delete grocery list item - please try again later!');
    setIsSubmitting(false);
  }
}

//DELETING/////////////////////////////////////////////////////

  async function createMealWithoutGroceryItem(theMeal,thisId){

    let newGroceryList = []
    theMeal.groceryItems.map((item) => {
      //This adds back all grocery items but the one with thisId
      if(item.thisId !== thisId){
        newGroceryList.push({ description: item.description, qty: item.qty, checkedOff: item.checkedOff, mealId: item.mealId,thisId: item.thisId, id:item.id?item.id:item.thisId,group: item.group });
      }
    });

    let updatedMeal;
    let noGroceries;
    console.log("ManageGroceryItem group:",group);
    console.log("ManageGroceryItem groupUsing:",groupUsing);
    if(newGroceryList.length>0){
      updatedMeal={
        date: theMeal.date,
        description: theMeal.description,
        id: theMeal.id,
        group: group?group:groupUsing,
        groceryItems: newGroceryList,
      }
    }else{
      noGroceries = true;
      updatedMeal={
        date: theMeal.date,
        description: theMeal.description,
        id: theMeal.id,
        group: group?group:groupUsing,
        groceryItems:[]
      }
    }

    console.log("ManageGroceryItem updatedMeal: ",updatedMeal)
    //update meal in firebase
    await updateMealRaw(updatedMeal.id,updatedMeal);

    //update meal in ctx
    mealsCtx.updateMeal(updatedMeal.id,updatedMeal)
  }
  //DELETING/////////////////////////////////////////////////////

  function cancelHandler() {
    navigation.goBack();
  }

  async function confirmHandler(groceryData) {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        setGroceryItem(groceryData);
        groceriesCtx.updateList(editedGroceryId, groceryData);
        await updateList(editedGroceryId, groceryData);
        //if the grocery item is part of a meal...
        if(groceryData.mealDesc!=="NO MEAL"){
          const currentCtxMeal = mealsCtx.meals.find((meal) => meal.id === groceryData.mealId)
          //create mealData
          let newGroceryList = []
          currentCtxMeal.groceryItems.map((item) => {
            //This adds back all grocery items but the one with thisId
            if(item.thisId !== groceryItem.thisId){
                newGroceryList.push({ 
                  description: item.description, 
                  qty: item.qty, 
                  checkedOff: item.checkedOff, 
                  mealId: item.mealId,
                  mealDesc: groceryData.mealDesc,
                  thisId: item.thisId, 
                  id:item.id,
                  group:group?group:groupUsing});
            }
          });

          //add the current grocery item
          newGroceryList.push(groceryData);
          let updatedMeal;

          updatedMeal={
            date: new Date(currentCtxMeal.date),
            description: currentCtxMeal.description,
            id: groceryData.mealId,
            group: group?group:groupUsing,
            groceryItems: newGroceryList,
          }
          //update meal in context
          mealsCtx.updateMeal(groceryData.mealId,updatedMeal);
          //update meal in firebase
          updateMealRaw(groceryData.mealId,updatedMeal)
          console.log("ManageGroceryItems gets to goback")
          navigation.goBack();
        }else{
          navigation.goBack();
        }
      } else {//create new grocery item with no meal associated.
        
        console.log("ManageGroceryItem saving before:",groceryData);
        const id = await storeList(groceryData);
        const newGrocery = { 
          description: groceryData.description, 
          qty: groceryData.qty, 
          checkedOff: "",
          mealDesc: "NO MEAL",
          mealId: 1,
          thisId: id, id:id,
          group: group?group:groupUsing}
          console.log("ManageGroceryItem saving after:",newGrocery);
        setGroceryItem(newGrocery);
        groceriesCtx.addList({ ...newGrocery, id: id });
        updateList(id, newGrocery);
        navigation.goBack();
      }
      
    } catch (error) {
      setError('Could not save data - please try again later!');
      console.log('Could not save data - please try again later!',error);
      setIsSubmitting(false);
    }
  }

  
  //prepare the overlays if they are needed.
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
        <GroceryForm
          submitButtonLabel={isEditing ? 'Update' : 'Add'}
          onSubmit={confirmHandler}
          onCancel={cancelHandler}
          defaultValues={groceryItem}
          group={group}
        />
        {isEditing && (
          <View style={styles.deleteContainer}>
            <IconButton
              icon="trash"
              color={GlobalStyles.colors.error500}
              size={36}
              onPress={deleteGroceryHandler}
            />
          </View>
        )}
        
      </ScrollView>
      <Footer/>
    </View>
  );
}

export default ManageGroceryItem;

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
