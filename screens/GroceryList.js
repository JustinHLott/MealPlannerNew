import { useContext, useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from "@react-navigation/native";

import GroceriesOutput from '../components/GroceriesOutput/GroceriesOutput';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import LoadingOverlay from '../components/UI/LoadingOverlay';
import { ListsContext } from '../store/lists-context';
import { fetchLists } from '../util/http-list';
import { getValue} from '../util/useAsyncStorage';
import { useEmail } from '../store/email-context';

function GroceryList() {
  //console.log("makes it to grocerylist")
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState();
  const [recentLists, setRecentLists] = useState();
  const [firstTime, setFirstTime] = useState(true);
  const { emailAddress, setEmailAddress } = useEmail();
  const {groupUsing, setGroupUsing} = useEmail();

  const listsCtx = useContext(ListsContext);

  useEffect(() => {
    setIsFetching(true);
    async function getList() {
      
      try {
        console.log("Makes it to useEffect");
        const items = await fetchLists();
        //console.log("GroceryList fetched items:",items)

        const result = pullGroupChosen()
        //.then((result)=>{
          //console.log("RecenetMeals groupChosen:",result);
          let allItems = [];

          items.map((item)=>{
            //console.log("RecentMeals mapped group:",meal)
            if(item.group === result){
              console.log("GroceryList item.group:",item.group,"usingGroup:",result)
              allItems.push(item);
            }
          })
          // console.log("RecentMeals allItems:",allItems);
          // console.log("RecentMeals typeOf:",typeof allItems)
          if(typeof allItems ==='object'){
          
            listsCtx.setLists(allItems);
            //console.log("RecentMeals meals:",mealsCtx.meals);
          }
        //})
        listsCtx.setLists(items);
        setRecentLists(items);
      } catch (error) {
        console.log(error);
        setError('Could not fetch lists!');
      }
    }
    getList();
    setIsFetching(false);
  }, []);

  //Ensure reload of lists////////////////////////////////////////////////////
  useFocusEffect(
    useCallback(() => {
      setFirstTime(true);
    }, [])
  );

  async function pullGroupChosen(){
    const accountTypeChosen = await getValue(emailAddress+"groupChosen");
    console.log("GroceryList pullGroupChosen:",groupUsing?groupUsing:accountTypeChosen)
    return groupUsing?groupUsing:accountTypeChosen;
  };

  // function removePrefix(text="", prefix=""){
  //   if (typeof text === 'string'&&typeof prefix === 'string'){
  //       return text.startsWith(prefix) ? text.slice(prefix.length) : text;
  //   }else{
  //       return text;
  //   }
  // };

  if(firstTime===true){
    console.log("GroceryList firstTime")
    setFirstTime(false);
    getLists();
  }

  async function getLists() {
    //console.log("GroceryList items:",listsCtx.lists)
    //setRecentLists(listsCtx.lists);
    try {
      setIsFetching(true);
      console.log("Makes it to useEffect");
      const items = await fetchLists();
      console.log("Grocery items list in GroceryList: ")

      const groupUsing = pullGroupChosen()
      .then((result)=>{
        //console.log("RecenetMeals groupChosen:",result);
        let allItems = [];

        items.map((item)=>{
          //console.log("RecentMeals mapped group:",meal)
          if(item.group === result){
            allItems.push(item);
          }
        })
        // console.log("RecentMeals allItems:",allItems);
        // console.log("RecentMeals typeOf:",typeof allItems)
        if(typeof allItems ==='object'){
        
          listsCtx.setLists(allItems);
          setRecentLists(items);
          //console.log("RecentMeals meals:",mealsCtx.meals);
        }
      })
      //listsCtx.setLists(items);
      
    } catch (error) {
      console.log(error);
      setError('Could not fetch lists!');
    } finally {
      setIsFetching(false);
    }
  }
//Ensure reload of lists////////////////////////////////////////////////////

  useEffect(() => {
    setRecentLists(listsCtx.lists)
  }, [listsCtx.lists]);

  // Trigger update every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      //console.log("useFocusEffect")
      setIsFetching(true);
      fetchGroceryList();
      setIsFetching(false);

    }, [listsCtx.lists]) // Dependencies ensure it runs when meals change
  );

  function fetchGroceryList(){
    setRecentLists(listsCtx.lists)
    //console.log(recentLists);
  }

  if (error && !isFetching) {
    return <ErrorOverlay message={error} />;
  }

  if (isFetching) {
    return <LoadingOverlay />;
  }

  return (
    <GroceriesOutput
      groceries={recentLists}
      //groceries={listsCtx.lists}
      fallbackText="No grocery items..."
    />
  );
}

export default GroceryList;
