import { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import GroceriesList from './GroceriesList';
import { ListsContext } from '../../store/lists-context';
import Footer from '../Footer';

function GroceriesOutput({ groceries, fallbackText }) {

  const [theArray, setTheArray] = useState(groceries);
  const listsCtx = useContext(ListsContext);

  useEffect(()=>{
    setTheArray(groceries);
  },[])

  useEffect(()=>{
    setTheArray(listsCtx.lists);
  },[listsCtx.lists])

  function handleSorting(sortType){
    console.log("GroceriesOutput")
    let sortedGroceries = [];
    if(sortType==="default"){
      sortedGroceries = [...groceries].reverse();
      setTheArray(sortedGroceries);
      listsCtx.sortList(sortedGroceries,sortType);
    }else if(sortType==="item"){
      sortedGroceries = [...groceries].sort((a, b) => {
        const nameA = a.description ? a.description.toLowerCase() : ''; // Convert to lowercase, handle undefined
        const nameB = b.description ? b.description.toLowerCase() : '';
        return nameA.localeCompare(nameB); // Compare alphabetically
      });
      setTheArray(sortedGroceries);
      listsCtx.sortList(sortedGroceries,sortType);
    }else if(sortType==="meal"){
      sortedGroceries = [...groceries].sort((a, b) => {
        const nameA = a.mealDesc ? a.mealDesc.toLowerCase() : ''; // Convert to lowercase, handle undefined
        const nameB = b.mealDesc ? b.mealDesc.toLowerCase() : '';
        return nameA.localeCompare(nameB); // Compare alphabetically
      });
      setTheArray(sortedGroceries);
      listsCtx.sortList(sortedGroceries,sortType);
    }
  }


  let content = <Text style={styles.infoText}>{fallbackText}</Text>;

  if (groceries.length > 0) {
    content = <GroceriesList groceries={theArray} handleSorting={handleSorting} />;
  }

  return (
    <View style={styles.container}>
      <View style={{flex:1}}>
        {content}
      </View>
      
      <Footer/>
    </View>
  );
}

export default GroceriesOutput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  infoText: {
    color: GlobalStyles.colors.primary50,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});
