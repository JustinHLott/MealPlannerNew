import {useContext, useState, useFocusEffect, useCallback} from 'react';
import { FlatList,View, StyleSheet } from 'react-native';

import GroceryItem from './GroceryItem';
import Button from '../UI/Button';
import { ListsContext } from '../../store/lists-context';

function GroceriesList({ groceries, handleSorting }) {
  const listsCtx = useContext(ListsContext);
  const [sortMethod, setSortMethod] = useState("default");
  const [theArray, setTheArray] = useState(groceries);

  // // Trigger update every time the screen is focused
  // useFocusEffect(
    
  //   useCallback(() => {
  //     // if(sortMethod==="item"){
  //     //   handleSortByItem();
  //     // }else if(sortMethod==="meal"){
  //     //   handleSortByMeal();
  //     // }else if(sortMethod==="default"){
  //     //   handleSortByDefault();
  //     // });
  //     //setTheArray(listsCtx.lists);
  //   //}, [listsCtx.lists]) // Dependencies ensure it runs when grocery list changes
  //   }, []) // Dependencies ensure it runs when grocery list changes
  // );

  function handleSortByItem(){
    const sortedGroceries = [...groceries].sort((a, b) => {
    //groceries = [...groceries].sort((a, b) => {
      const nameA = a.description ? a.description.toLowerCase() : ''; // Convert to lowercase, handle undefined
      const nameB = b.description ? b.description.toLowerCase() : '';
      return nameA.localeCompare(nameB); // Compare alphabetically
    });
    setTheArray(sortedGroceries);
    setSortMethod("item");
  }

  function handleSortByMeal(){
    const sortedGroceries = [...groceries].sort((a, b) => {
    //groceries = [...groceries].sort((a, b) => {
      const nameA = a.mealDesc ? a.mealDesc.toLowerCase() : ''; // Convert to lowercase, handle undefined
      const nameB = b.mealDesc ? b.mealDesc.toLowerCase() : '';
      return nameA.localeCompare(nameB); // Compare alphabetically
    });
    setTheArray(sortedGroceries);
    setSortMethod("meal");
  }

  function handleSortByDefault(){
    const sortedGroceries = [...groceries].reverse();
    setTheArray(sortedGroceries);
    setSortMethod("default");
  }

  //create individual grocery list items
  function renderGroceryItem(itemData) {
    return <GroceryItem itemData={itemData} sortStyle={sortMethod} />;
  }

  return (
    <View style = {styles.container}>
      <View style={styles.buttonContainer}>
        <Button onPress={()=>handleSorting("item")} style={{marginLeft:30}}>Sort by Item</Button>
        <Button onPress={()=>handleSorting("meal")} style={{marginLeft:20}}>Sort by Meal</Button>
        <Button onPress={()=>handleSorting("default")} style={{marginLeft:20}}>Sort Default</Button>
      </View>
      <FlatList
        data={groceries}
        renderItem={renderGroceryItem}
        keyExtractor={(item) => item.id?item.id:item.thisId}
      />
    </View>
    
  );
}

export default GroceriesList;

const styles = StyleSheet.create({
  container:{
    flex: 1,
  },
  buttonContainer:{
    flexDirection:'row',
    alignItems: 'center',
    //justifyContent: 'space-between',
    marginBottom: 8,
  },
})
