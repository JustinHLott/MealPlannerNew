import {useState, useContext} from 'react';

import { ListsContext } from '../../store/lists-context';
import { MealsContext } from '../../store/meals-context';
import { updateMealRaw } from '../../util/http';
import { deleteList } from '../../util/http-list';

export default function Delete(itemData){
    const groceriesCtx = useContext(ListsContext);
    const mealsCtx = useContext(MealsContext);

    const [groceryItem,setGroceryItem] = useState(null);
    
    delete2(itemData)
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

  async function delete2(itemData) {
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
        setGroceryItem(itemData.item);

        //console.log("GroceryItem meals: ",mealsCtx.meals)
        
      }
    } catch (error) {
      console.log(error)
      setError('Could not delete grocery list item - please try again later!');
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
        group: theMeal.group,
        groceryItems: newGroceryList,
      }
    }else{
      noGroceries = true;
      updatedMeal={
        date: theMeal.date,
        description: theMeal.description,
        id: theMeal.id,
        group: theMeal.group,
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

  return groceryItem;
};