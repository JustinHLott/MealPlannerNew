import {useContext, useState, useFocusEffect, useCallback} from 'react';
import { FlatList,View, StyleSheet } from 'react-native';

import GroceryItem from './GroceryItem';
import Button from '../UI/Button';
import { ListsContext } from '../../store/lists-context';

function GroceriesList({ groceries, handleSorting }) {
  const listsCtx = useContext(ListsContext);
  const [sortMethod, setSortMethod] = useState("default");
  const [theArray, setTheArray] = useState(groceries);

    //create individual grocery list items
  function renderGroceryItem(itemData) {
    return <GroceryItem itemData={itemData} sortStyle={sortMethod} />;
  }

  return (
    <View style = {styles.container}>
      <View style={styles.buttonContainer}>
        <Button onPress={()=>handleSorting("item")}>Sort by Item</Button>
        <Button onPress={()=>handleSorting("meal")}>Sort by Meal</Button>
        <Button onPress={()=>handleSorting("default")}>Sort Default</Button>
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
    justifyContent: 'space-between',
    marginBottom: 8,
  },
})
