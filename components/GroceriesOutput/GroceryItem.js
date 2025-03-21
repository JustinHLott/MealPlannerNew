import { useState, useContext,useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { GlobalStyles } from '../../constants/styles';
import IconButtonNoText from '../UI/IconButtonNoText';
import ErrorOverlay from '../UI/ErrorOverlay'
import LoadingOverlay from '../UI/LoadingOverlay'
import { ListsContext } from '../../store/lists-context';
import { MealsContext } from '../../store/meals-context';
import { deleteList,updateList } from '../../util/http-list';
import { updateMeal,updateMealRaw } from '../../util/http';
//import { getFormattedDate } from '../../util/date';

// const defaultMeal={
//   id:"",
//   date:"",
//   description:"",
//   groceryItems:[]
// }
function GroceryItem({ itemData }) {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [meal2, setMeal2] = useState();
  //const [meal, setMeal] = useState(...defaultMeal);
  //const isEditing = !!id;

  const groceriesCtx = useContext(ListsContext);
  const mealsCtx = useContext(MealsContext);

  useEffect(()=>{
    let selectedMeal;
    let selectedList;
    if(itemData.item.id){
      selectedList = groceriesCtx.lists.find(
        //(list) => list.id?list.id:list.thisId === itemData.item.id?itemData.item.id:itemData.item.thisId
        (list) => list.id === itemData.item.id
      );
      //console.log("GroceryItem id: ",selectedList);
    
      selectedMeal = mealsCtx.meals.find(
        (meal) => meal.id === selectedList?.mealId
      );
    }else{
      selectedList = groceriesCtx.lists.find(
        //(list) => list.id?list.id:list.thisId === itemData.item.id?itemData.item.id:itemData.item.thisId
        (list) => list.thisId === itemData.item.thisId
      );
      //console.log("GroceryItem thisId: ",selectedList);
    }

    selectedMeal = mealsCtx.meals.find(
      (meal) => meal.id === selectedList?.mealId
    );
    //console.log("meal1: ", meal);
  
    if(selectedMeal){
      //console.log("GroceryItem foundselectedMeal",selectedMeal.description);
      setMeal2(selectedMeal);
      //console.log("meal2: ", meal);
      selectedMeal = selectedMeal?.description;
    }else{
      selectedMeal={
          id: itemData.item.mealId,
          date:"",
          description:"",
          groceryItems:[]
        };
        setMeal2(selectedMeal);
    }
  },[])

  const selectedList = groceriesCtx.lists.find(
    (list) => list.id === itemData.item.id
  );
  //console.log("groceryItem: ",selectedList);

  let selectedMeal = mealsCtx.meals.find(
    (meal) => meal.id === selectedList?.mealId
  );
  //console.log("meal1: ", meal);

  if(selectedMeal){
    //console.log("foundselectedMeal",selectedMeal.description);
    //setMeal2(selectedMeal);
    //console.log("meal2: ", meal);
    selectedMeal = selectedMeal?.description;
  }else{
    selectedMeal="No Meal";
  }

  function groceryPressHandler() {
    // console.log("GroceryItem id/thisId: ",itemData.item.id?itemData.item.id:itemData.item.thisId);
    // console.log("GroceryItem id: ",itemData.item.id);
    // console.log("GroceryItem thisId: ",itemData.item.thisId);
    navigation.navigate('ManageGroceryItem', {
      groceryId: itemData.item.id?itemData.item.id:itemData.item.thisId,
      item: itemData.item,
      meal: meal2,
    });
  }

    /////////////////////////////////////////////////////
    function deleteFromGroceryCtx(thisId){
      //console.log("GroceryIte before delete",groceriesCtx.lists)
      // console.log("MealForm2 thisId",thisId)
      const updatedGroceries1 = groceriesCtx.lists.filter(grocery => grocery.thisId !== thisId);
      const updatedGroceries = updatedGroceries1.filter(grocery => grocery.id !== thisId);
      groceriesCtx.setLists(updatedGroceries);
      //console.log("GroceryItem after delete",updatedGroceries);
    }
    /////////////////////////////////////////////////////

  async function deleteGroceryHandler() {
    setIsSubmitting(true);
    try {
      //console.log("Made it to deleteGroceryHandler")
      if(itemData.item.id){
        console.log("GroceryItem id: ",itemData.item.id)
        //delete grocery item from firebase http
        await deleteList(itemData.item.id);

        //delete grocery item from grocery ctx
        deleteFromGroceryCtx(itemData.item.id);
            //groceriesCtx.deleteList(itemData.item.id);

        // //update meal state
        // deleteGroceryItem(itemData.item.id)
        console.log("GroceryItem delete meal: ",itemData.item)
        //update mealsCtx
        if(itemData.item.mealId){
          const selectedMeal = mealsCtx.meals.find(
            (meal) => meal.id === itemData.item.mealId
          );
          if(selectedMeal){
            //console.log("MealForm2 selectedMeal",selectedMeal)
            await createMealWithoutGroceryItem(selectedMeal,itemData.item.id);
            console.log("GroceryItem delete Hi")
          }else{
            console.log("GroceryItem no id");
          }
        }else{
          console.log("GroceryItem no mealId");
        }
      }else{
        console.log("GroceryItem thisId: ",itemData.item.thisId);
        console.log("GroceryItem item: ",itemData.item);

        //update mealsCtx
        if(itemData.item.mealId){
          const selectedMeal = mealsCtx.meals.find(
            (meal) => meal.id === itemData.item.mealId
          );
          if(selectedMeal){
            //console.log("MealForm2 selectedMeal",selectedMeal)
            await createMealWithoutGroceryItem(selectedMeal,itemData.item.thisId);
            console.log("GroceryItem delete Hi(no id)")
          }else{
            console.log("GroceryItem no thisId");
          }
        }else{
          console.log("GroceryItem no mealId");
        }

        //delete grocery item from firebase http
        await deleteList(itemData.item.thisId);

        //delete grocery item from grocery ctx
        deleteFromGroceryCtx(itemData.item.thisId)
            //groceriesCtx.deleteList(itemData.item.thisId);

        // //update meal state
        // deleteGroceryItem(itemData.item.id)

        //console.log("GroceryItem meals: ",mealsCtx.meals)
        
      }
    } catch (error) {
      console.log(error)
      setError('Could not delete grocery list item - please try again later!');
      setIsSubmitting(false);
    }
  }

  /////////////////////////////////////////////////////

  async function createMealWithoutGroceryItem(theMeal,thisId){
    console.log("GroceryItem createMealWithoutGroceryItem",theMeal.date)
    let noGroceries = true;
    let newGroceryList = []
    theMeal.groceryItems.map((item) => {
      //This adds back all grocery items but the one with thisId
      if(item.thisId !== thisId){
        newGroceryList.push({ description: item.description, qty: item.qty, checkedOff: item.checkedOff, mealId: theMeal.id, thisId: item.thisId?item.thisId:item.id, id:item.id?item.id:item.thisId });
      }
    });

    let updatedMeal;
    if(newGroceryList.length>0){
      updatedMeal={
        date: theMeal.date,
        description: theMeal.description,
        id: theMeal.id,
        groceryItems: newGroceryList,
      }
    }else{
      noGroceries = true;
      updatedMeal={
        date: theMeal.date,
        description: theMeal.description,
        id: theMeal.id,
        groceryItems: []
      }
    }
    
    // const currentMealData = mealsCtx.meals.find(
    //   (meal) => meal.id === thisId
    // );

    //update meal in ctx
    mealsCtx.updateMeal(theMeal.id,updatedMeal)

    //update meal in firebase
    console.log("GroceryItem delete print before await",theMeal.groceryItems);
    await updateMealRaw(updatedMeal.id,updatedMeal);
    console.log("GroceryItem delete print after await",updatedMeal.groceryItems)
  }
  //DELETING/////////////////////////////////////////////////////

  async function addCtxList(updatedGrocery,id){
    try{
      console.log("GroceryItems addCtxlist")
      //setNewItemId(responseGrocery.data.name);
      //console.log("ManageMeals newItemId: ", newItemId)
      console.log("GroceryItems newItemId2: ", id)
      const groceryItem={
        ...updatedGrocery, thisId: id
      };
      //const groceryId = responseGrocery.data.name;
      //updateList(responseGrocery.data.name,groceryItem);
      await updateList(id,groceryItem);
      groceriesCtx.addList(groceryItem);
    }catch(error){
      console.error("ManageMeal addCtxList Error:", error);
    }
  }

  //this function is used in http where it cannot work with context.
  function updateCtxMeal(id,mealData){
    //update meal in context
    mealsCtx.updateMeal(id,mealData);
  }

  function deleteCtxList(groceryItem){
    console.log("GroceryItems delete groceryItem: ",groceryItem)
    groceriesCtx.deleteList(groceryItem);
  }

  if (error && !isSubmitting) {
    return <ErrorOverlay message={error} />
  }

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  // function thaiCurry2(){
  //   return thaiCurry;
  // }
  return (
    <Pressable
      onPress={groceryPressHandler}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={styles.groceryItem}>
        <Text style={[styles.textBase, styles.qty]}>
          {itemData.item.qty}
        </Text>
        <Text style={[styles.textBase, styles.description]}>
          {itemData.item.description}
        </Text>
        <Text style={[styles.textBase, styles.mealDesc]}>
          {itemData.item.mealDesc?itemData.item.mealDesc:selectedMeal}
          {/* {itemData.item.mealDesc?itemData.item.mealDesc:selectedMeal} */}
        </Text>
        { (
        <View style={styles.deleteContainer}>
          <IconButtonNoText
            icon="trash"
            color={GlobalStyles.colors.error500}
            size={20}
            onPress={deleteGroceryHandler}
            forLongPress={()=>{Alert.alert("Function of Button","Trash button deletes grocery item")}}
          />
        </View>
      )}
      </View>
    </Pressable>
  );
}

export default GroceryItem;

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
  },
  groceryItem: {
    padding: 6,
    marginVertical: 4,
    backgroundColor: GlobalStyles.colors.primary500,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 6,
    elevation: 3,
    shadowColor: GlobalStyles.colors.gray500,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
  },
  textBase: {
    color: GlobalStyles.colors.primary50,
  },
  qty: {
    fontSize: 16,
    //marginBottom: 4,
    fontWeight: 'bold',
    width:'8%',
  },
  description: {
    fontSize: 16,
    //marginBottom: 4,
    fontWeight: 'bold',
    width:'50%',
  },
  mealDesc: {
    fontSize: 12,
    //marginBottom: 4,
    //fontWeight: 'bold',
    color: GlobalStyles.colors.primary100,
    width:'35%',
  },
  amountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 0
    ,
    backgroundColor: GlobalStyles.colors.primary50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    minWidth: 80,
  },
  amount: {
    color: GlobalStyles.colors.primary500,
    fontWeight: 'bold',
  },
  deleteContainer: {
    marginBottom: 0,
    paddingBottom: 0,
    //marginTop: 16,
    //paddingTop: 8,
    //borderTopWidth: 2,
    //borderTopColor: GlobalStyles.colors.primary200,
    //alignItems: 'center',
  },
});
