import { createContext, useReducer, useState } from 'react';

export const ListsContext = createContext({
  lists: [],
  qtys: [],
  addList: ({ item,description, qty, checkedOff, id, mealId,thisId, mealDesc, group }) => {},
  setLists: (lists) => {},
  deleteList: (id) => {},
  updateList: (id, { item,description, qty, checkedOff, mealId,thisId, mealDesc, group }) => {},
  setQty: (qtys) => {}, // Function to set multiple qtys
  addQty: (qty) => {}, // Function to add a single qty
  pullMeal: (id)=>{},
  sortList: (lists,sortType)=>{},
});

function listsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, lists: [action.payload, ...state.lists] };
    case 'SORT_LIST':
      let sorted=[];
      if(action.payload.sortType==="item"){
        console.log("sort by item")
        //sorted ={ ...state, lists: action.payload.lists.sort((a, b) => a.description.localeCompare(b.description))};
        sorted = { ...state, lists: action.payload.lists.sort((a, b) => {
          const nameA = a.description ? a.description.toLowerCase() : ''; // Convert to lowercase, handle undefined
          const nameB = b.description ? b.description.toLowerCase() : '';
          return nameA.localeCompare(nameB); // Compare alphabetically
        })};
      }else if(action.payload.sortType==="meal"){
        console.log("sort by meal")
        //sorted ={ ...state, lists: action.payload.lists.sort((a, b) => a.mealDesc.localeCompare(b.mealDesc))};
        sorted = { ...state, lists: action.payload.lists.sort((a, b) => {
          const nameA = a.mealDesc ? a.mealDesc.toLowerCase() : ''; // Convert to lowercase, handle undefined
          const nameB = b.mealDesc ? b.mealDesc.toLowerCase() : '';
          return nameA.localeCompare(nameB); // Compare alphabetically
        })};
      }else if(action.payload.sortType==="default"){
        console.log("sort by default")
        //sorted = { ...state, lists: action.payload.lists.reverse() };
        sorted = { ...state, lists: action.payload.lists.sort((a, b) => {
          const nameA = a.index ? a.index.toLowerCase() : ''; // Convert to lowercase, handle undefined
          const nameB = b.index ? b.index.toLowerCase() : '';
          return nameA.localeCompare(nameB); // Compare alphabetically
        })};
      }
      return sorted;
    case 'SET':
      //const inverted = { ...state, lists: action.payload.reverse() };
      const inverted = { ...state, lists: action.payload };
      return inverted;
    case 'UPDATE':
      const updatableListIndex = state.lists.findIndex(
        (list) => list.id === action.payload.id
      );
      const updatableList = state.lists[updatableListIndex];
      const updatedItem = { ...updatableList, ...action.payload.data };
      const updatedLists = [...state.lists];
      updatedLists[updatableListIndex] = updatedItem;
      return { ...state, lists: updatedLists };
    case 'PULL_MEAL':
        const updatableListIndex2 = state.lists.findIndex(
          (list) => list.id === action.payload.id
        );
        const updatableList2 = state.lists[updatableListIndex2];
        const updatedItem2 = { ...updatableList2, ...action.payload.data };
        // const updatedLists = [...state.lists];
        // updatedLists[updatableListIndex] = updatedItem;
        return { ...state, lists: updatedItem2 };
    case 'DELETE':
      return { ...state, lists: state.lists.filter((list) => list.itemId !== action.payload) };
    case 'SET_QTYS': 
      return { ...state, qtys: action.payload }; // Setting multiple dates
    case 'ADD_QTY': 
      return { ...state, qtys: [...state.qtys, action.payload] }; // Adding a single date
    default:
      return state;
  }
}

function ListsContextProvider({ children }) {
  const [listsState, dispatch] = useReducer(listsReducer, { lists: [], qtys: [] });

  function addList(listData) {
    dispatch({ type: 'ADD', payload: listData });
  }

  function setLists(lists2) {
    //console.log("lists-context setLists: ",lists2);
    //Only resets the grocery list array if there is a replacement.
    if(lists2){
      dispatch({ type: 'SET', payload: lists2 });
    }
    
  }

  function deleteList(id) {
    dispatch({ type: 'DELETE', payload: id });
  }

  function updateList(id, listData) {
    dispatch({ type: 'UPDATE', payload: { id: id, data: listData } });
  }

  function pullMeal(id, listData) {
    dispatch({ type: 'PULL_MEAL', payload: { id: id, data: listData } });
  }

  function setQtys(qtys) {
    dispatch({ type: 'SET_QTYS', payload: qtys });
  }

  function addQty(qty) {
    dispatch({ type: 'ADD_QTY', payload: qty });
  }

  function sortList(lists,sortType) {
    dispatch({ type: 'SORT_LIST', payload: { lists: lists, sortType: sortType } });
  }

  const value = {
    lists: listsState.lists,
    qtys: listsState.qtys,
    setLists: setLists,
    addList: addList,
    deleteList: deleteList,
    updateList: updateList,
    pullMeal: pullMeal,
    setQtys: setQtys,
    addQty: addQty,
    sortList: sortList,
  };

  return (
    <ListsContext.Provider value={value}>
      {children}
    </ListsContext.Provider>
  );
}

export default ListsContextProvider;
