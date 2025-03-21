import axios from 'axios';

const BACKEND_URL =
  'https://justinhlottcapstone-default-rtdb.firebaseio.com';

export async function storeList(listData) {
  try{
    const response = await axios.post(BACKEND_URL + '/grocery.json', listData);
    const id = response.data.name;
    console.log("http-list storeList id: ",id)
    return response.data.name;
  }catch(error){
    console.log("http-list storeList error:",error)
  }
  
}

export async function fetchLists() {
  console.log("got to fetch lists")
  const response = await axios.get(BACKEND_URL + '/grocery.json');
  console.log("fetched grocery list")
  const listsUnsorted = [];

  for (const key in response.data) {
    const listObj = {
      id: key,
      qty: response.data[key].qty,
      description: response.data[key].description,
      thisId: response.data[key].thisId,
      mealId: response.data[key].mealId,
      mealDesc: response.data[key].mealDesc,
      checkedOff: response.data[key].checkedOff,
      group: response.data[key].group,
    };
    listsUnsorted.push(listObj);
    //console.log(listsUnsorted);
  }

  // //This sorts the lists by the date field.
  // const lists = [...listsUnsorted,].sort((a, b) => a.date - b.date);
   //console.log("grocery list: ",listsUnsorted);
  // console.log( lists);
  return listsUnsorted;
}

export function updateList(id, listData) {
  return axios.put(BACKEND_URL + `/grocery/${id}.json`, listData);
}

export function deleteList(id) {
  //console.log("deletelist: ",id)
  //delete from ctx
  //deleteFromGroceryCtx(id)
  //delete from firebase
  return axios.delete(BACKEND_URL + `/grocery/${id}.json`);
}
