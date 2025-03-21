import React, { useState, useContext, useEffect } from "react";
import { View, TextInput, FlatList, Text, Pressable, Alert, ActivityIndicator, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
//import DatePicker from "react-native-date-picker";

import { GlobalStyles } from '../../constants/styles';
import Input from './Input';
import Button from '../UI/Button';
import IconButtonNoText from "../UI/IconButtonNoText";
import { MealsContext } from '../../store/meals-context';
import { ListsContext } from '../../store/lists-context';
import { isValidDate, getDateMinusDays,getFormattedDate } from "../../util/date";
import { storeList,deleteList,updateList } from "../../util/http-list";
import { updateMeal,updateMealRaw } from "../../util/http";
import { getValue } from "../../util/useAsyncStorage";
import { useEmail } from "../../store/email-context";

const defaultMeal = {
  date: "",
  description: "",
  groceryItems: [], // Start as an empty array
  group:"",
};

//defaultGroceryItem needs to keep description and qty as is.
const defaultGroceryItem = { description: "", qty: "", checkedOff: "", group: "" };

export default function MealForm2({ initialMeal = {}, defaultDate, onSubmit, submitButtonLabel }) {
  // Merge `initialMeal` with `defaultMeal` to avoid undefined values
  const [meal, setMeal] = useState({ ...defaultMeal, ...initialMeal });
  const [description, setDescription] = useState(initialMeal.description?initialMeal.description:"");
  const [date, setDate] = useState(initialMeal.date?initialMeal.date:"");
  const [pencilColor, setPencilColor] = useState(GlobalStyles.colors.primary100);
  const [errorMessage, setErrorMessage] = useState("filled");
  const [editableOr, setEditableOr] = useState(false);
  const [checked,setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [additionalGroceryItems, setAdditionalGroceryItems]=useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [groceryDescription, setGroceryDescription] = useState('');
  const [qty, setQty] = useState('');
  const [isAddGroceryVisible, setIsAddGroceryVisible] = useState(false);
  const [isNewGroceryVisible, setIsNewGroceryVisible] = useState(false);
  const [group, setGroup] = useState(null);
  const { emailAddress, setEmailAddress } = useEmail();
  const {groupUsing, setGroupUsing} = useEmail();

  const mealsCtx = useContext(MealsContext);
  const listsCtx = useContext(ListsContext);

  //This only runs once when the screen starts up.
  useEffect(() => {
    if(submitButtonLabel==="Update"){
      setIsAddGroceryVisible(true);
      setIsNewGroceryVisible(false);
    }else{
      setIsAddGroceryVisible(false);
      setIsNewGroceryVisible(true);
    }
    if(typeof initialMeal.description!=="undefined"){
      //do nothing
      console.log("MealForm2 useEffect defined:",initialMeal);

      let updatedMeal3 = {
        date: "",
        description: "",
        group: "",
        groceryItems: [], // Empty grocery items array
        id: "",
      };

      // Ensure the string follows the YYYY-MM-DD or M-D-YYYY format
      const regex = /^(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/;
      const date2 = (new Date(initialMeal.date)).toISOString().slice(0, 10);
      if (!regex.test(date2)) {
        //console.log("useEffect Invalid date:",date2);
      }else{
        const today=getDateMinusDays(new Date(initialMeal.date),0);
        //console.log("useEffect Valid date:",today);
        //convert date to text string
        let date1 = today.toISOString().slice(0, 10);
        //console.log("useEffect Valid date1:",date1);
        setDate(date1);

        //pull the group id that will be associated to the meal.
        getGroup()
        .then((result)=>{
          if(initialMeal.groceryItems){
            setGroup(result);
            updatedMeal3 = {
              date: date1,
              description: initialMeal.description,
              group: result?result:groupUsing,
              //groceryItems: {...initialMeal.groceryItems,group: group}, // Empty grocery items array with group
              groceryItems: initialMeal.groceryItems, // Empty grocery items array with group
              id: initialMeal.id,
            };
            //And update the meal with the new date
            setMeal(updatedMeal3);
            console.log("MealForm2 new meal noGroup:",updatedMeal3);
          }else{
            setGroup(result);
            updatedMeal3 = {
              date: date1,
              description: initialMeal.description,
              group: result?result:groupUsing,
              //groceryItems: initialMeal.groceryItems, // Empty grocery items array with group
              id: initialMeal.id,
            };
            //And update the meal with the new date
            setMeal(updatedMeal3);
            console.log("MealForm2 new meal withGroup:",updatedMeal3);
          }
        });
      }
    }else if(typeof initialMeal.description==="undefined"){
      console.log("MealForm2 useEffect unDefined:",initialMeal);
      let mostRecentMealDate=getDateMinusDays(new Date(),1);
      if(mealsCtx.meals.length>0){
        mostRecentMealDate = mealsCtx.meals.reduce((meal, latest) => new Date(meal.date) > new Date(latest.date) ? meal : latest).date;
      }
      //pull the group id that will be associated to the meal.
      getGroup()
      .then((result)=>{
        //if(result instanceof Promise){
          setGroup(result);

          //Add one day to the most recent date to get the date for the next new meal
          let date = new Date(mostRecentMealDate);
          date = getDateMinusDays(date, -1);
          
          const date2 = date
            .toISOString()
            .split("T")[0];
          setDate(date2);
          //setMaxDate(date2);
          console.log("MealForm2 group",result);
          // Create a new updated meal object
          //const updatedMeal3={mealsCtx.addMeal()}
          const updatedMeal2 = {
            date: date2,
            description: "",
            groceryItems: [], // Empty grocery items array
            group: result?result:groupUsing,
          };
          //And update the meal with the new date
          setMeal(updatedMeal2);
          console.log("MealForm2 newMeal:",updatedMeal2);

       // }
      })
      
      
    }
  }, []);


  async function getGroup(){
    return await getValue(emailAddress+"groupChosen");
  }
  // useEffect(() => {
  //   if (!description.trim()) {
  //     setErrorMessage("Both description and date are required!");
  //   } else {
  //     setErrorMessage(""); // Clear error when inputs are valid
  //   }
  // }, [description]);

  useEffect(() => {
    if (description === "" || date === "") {
      setErrorMessage("Both description and date are required!");
    } else {
      setErrorMessage(""); // Clear error when inputs are valid
    }
  }, [description]);

  // Function to update the meal's date or description
  const handleInputChange = (key, value) => {
    if(key==="date"){
      // Ensure the string follows the YYYY-MM-DD or M-D-YYYY format
      const regex = /^(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/;

      if (!regex.test(value)) {
        console.log("handle Invalid date:",value);// Not a complete date
        setDate(value);
        
      }else{
        const originalDate = new Date(value);
        const utcDate = originalDate.toISOString();
        // const today1= today.toISOString().slice(0, 10);
        console.log("handle valid date",value);

        setDate(value);
        const newDate = getDateMinusDays(new Date(value),-1)
        const newMeal={...meal,date:utcDate};
        setMeal(newMeal);
      }
    }else{
      setMeal((prevMeal) => ({
        ...prevMeal,
        [key]: value,
      }));
      setDescription(value);
    }
  };

  // Function to update grocery items
  const handleGroceryChange = (index, key, value) => {
    const updatedGroceryItems = [...meal.groceryItems];
    updatedGroceryItems[index][key] = value;
    //console.log("groceryitem before: ",updatedGroceryItems[index])
    updatedGroceryItems[index]["mealDesc"] = meal.description;
    updatedGroceryItems[index]["group"] = group?group:groupUsing;
    //console.log("groceryitem after: ",updatedGroceryItems[index])
    setMeal((prevMeal) => ({
      ...prevMeal,
      groceryItems: updatedGroceryItems,
    }));
    console.log("new meal: ",meal.groceryItems)
  };

    // Function to update grocery item checkbox
    const handleGroceryCheckbox = (index) => {
      const updatedGroceryItems = [...meal.groceryItems];
      const item = updatedGroceryItems[index]["checkedOff"];
      let tf = false;

      if(item){
        if (item.value === "checked"){
          updatedGroceryItems[index]["checkedOff"] = "unChecked"
          //setChecked(true);
          tf = true;
        }else{
          updatedGroceryItems[index]["checkedOff"] = "checked"
          //setChecked(false);
          tf = false;
        }
      }

      setMeal((prevMeal) => ({
        ...prevMeal,
        groceryItems: updatedGroceryItems,
      }));

      console.log(tf);
      return tf;
    };
    
  // Function to add a new grocery item
  const addGroceryItem = (theGroceryItem) => {
    //let theGroceryItem;
    if(meal.groceryItems){//if grocery items already
      console.log("MealForm2 add meal.groceryItems:",meal.groceryItems);
      if(submitButtonLabel==="Update"){//if updating, you can only add one grocery item on update
        const theGroceryList = meal.groceryItems;
        console.log("MealForm2 add groceryList:", theGroceryList)
        theGroceryList.map((theMeal)=>{
          if(!"thisId" in theMeal){
            setAdditionalGroceryItems(true);
          }
        })
        // theGroceryList.forEach((theMeal)=>{
        //   if(!"thisId" in theMeal){
        //     setAdditionalGroceryItems(true);
        //   }
        // })
        console.log("additionalGroceryItems update:",theGroceryItem)
        if(additionalGroceryItems===true){
          Alert.alert("When updating, you may only add one grocery item.")
        }else{
          setMeal((prevMeal) => ({
            ...prevMeal,
            groceryItems: [...prevMeal.groceryItems, { ...theGroceryItem  }],
          }));
          setAdditionalGroceryItems(true)
        }
      }else{//If adding a new meal you can add as many grocery items as you wish
        console.log("additionalGroceryItems unlimited!:",theGroceryItem)
        console.log("MealForm2 before:",meal)
        setMeal((prevMeal) => ({
          ...prevMeal,
          groceryItems: [...prevMeal.groceryItems, { ...theGroceryItem  }],
        }));
        console.log("MealForm2 after:",meal)
      }
    }
    else{//if no grocery items
      console.log("additionalGroceryItems 1st:",theGroceryItem)
      setMeal((prevMeal) => ({
        ...prevMeal,
        groceryItems: [{ ...theGroceryItem  }],
        //groceryItems: [{ ...defaultGroceryItem }],
      }));
      if(submitButtonLabel==="Update"){//if updating, you can only add one grocery item on update.
        setAdditionalGroceryItems(true)
      }
    }
  };

  function saveMeal(meal2){
    let noGroceries = false;
    console.log("Makes it to saveMeal in MealForm2",meal2);
    if(!meal2.date||!meal2.description.trim()){
      Alert.alert("Both description and date are required!");
    }else{
      //console.log("MealForm2 saveMeal date:",meal2.date);
      //console.log("MealForm2 updatedMeal: ",meal2);
      if(!meal2.groceryItems){
        noGroceries=true;
        // console.log("MealForm2 noGroceries t: ",noGroceries);
      }else{
        if(meal2.groceryItems.length>0){
          noGroceries=false;
          // console.log("MealForm2 noGroceries f: ",noGroceries);
          // console.log("MealForm2 f grocery items: ",meal.groceryItems);
        }else{
          noGroceries=true;
          // console.log("MealForm2 noGroceries f: ",noGroceries);
          // console.log("MealForm2 f grocery items: ",meal.groceryItems);
        }
      }
      //this does Add or Update the meal in state to firebase
      onSubmit(meal2,noGroceries);
    }
  }

  //DELETING/////////////////////////////////////////////////////
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
      console.log("MealForm2 no selectedMeal")
    }
    // console.log("MealForm2 after delete",updatedGroceries);
  }
  //DELETING/////////////////////////////////////////////////////
  // Function to delete grocery item
  async function deleteGroceryItem(index,mealId,thisId){
    const updatedGroceryItems = [...meal.groceryItems];
    updatedGroceryItems[index];
    console.log("MealForm2 deleteGroceryItem index",index,"thisId",thisId,"meal:",meal);
    setIsLoading(true);
    try{
      if(thisId){//If the grocery item has already been created and saved in the past...
        //remove grocery item from mealsCtx
        deleteFromGroceryCtx(thisId)

        //remove grocery item from firebase
        await deleteList(thisId);
      }

      if(mealsCtx.meals.find(
        (theMeal) => meal.id === theMeal.id
      )){
        //console.log("MealForm2 selectedMeal",meal)
        createMealWithoutGroceryItem(meal,thisId)
      }else{
        console.log("MealForm2 no selectedMeal")
      }
    }catch(error){

    }finally{
      //remove grocery item from state
      setMeal((prevMeal) => ({
        ...prevMeal,
        groceryItems: prevMeal.groceryItems.filter((_, i) => i !== index),
      }));
      setIsLoading(false);
    }
    
  };

//DELETING/////////////////////////////////////////////////////

  async function createMealWithoutGroceryItem(theMeal,thisId){
    console.log("MealForm2 createMealWithoutGroceryItem group:",group?group:groupUsing)
    let newGroceryList = []
    theMeal.groceryItems.map((item) => {
      //This adds back all grocery items but the one with thisId
      if(item.thisId !== thisId){
        newGroceryList.push({ description: item.description, qty: item.qty, checkedOff: item.checkedOff, mealId: item.mealId,thisId: item.thisId, id:item.id?item.id:item.thisId,group: group?group:groupUsing });
      }
    });

    let updatedMeal;
    let noGroceries;
    if(newGroceryList.length>0){
      updatedMeal={
        date: new Date(theMeal.date),
        description: theMeal.description,
        id: theMeal.id,
        groceryItems: newGroceryList,
      }
    }else{
      noGroceries = true;
      updatedMeal={
        date: new Date(theMeal.date),
        description: theMeal.description,
        id: theMeal.id,
        groceryItems: [],
      }
    }
    
    const currentMealData = mealsCtx.meals.find(
      (meal) => meal.id === thisId
    );

    
    console.log("MealForm2 updatedMeal: ",updatedMeal)
    try{
      //update meal in ctx
      console.log("first")
      mealsCtx.updateMeal(updatedMeal.id,updatedMeal)
    }finally{
      console.log("second")
      setMeal(updatedMeal);
    }
    
    //update meal in firebase
    await updateMealRaw(updatedMeal.id,updatedMeal);
    //await updateMeal(updatedMeal.id,updatedMeal,currentMealData, addCtxList, deleteCtxList, noGroceries)
  }
  //DELETING/////////////////////////////////////////////////////

  function makeDateEditable(){
    if(pencilColor==="green"){
      setEditableOr(false);
      setPencilColor(GlobalStyles.colors.primary100);
    }else{
      setEditableOr(true);
      setPencilColor("green");
    }
    
  }

  function add1GroceryItem(){
    console.log("additionalGroceryItems",additionalGroceryItems)
    if(additionalGroceryItems===true){
      Alert.alert("When updating, you may only add one grocery item.")
    }else{
      setModalVisible(true);
      setIsAddGroceryVisible(false);
    }
  }

  const handleAddMeal = (groceryItem) => {
    console.log('New Grocery Item:', groceryItem);
    //addGroceryItem(groceryItem);//defaultGroceryItem
    addGroceryItem(groceryItem);
    setGroceryDescription('');
    setQty('');
    setModalVisible(false); // Close modal after adding meal.
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ topMargin: 80 }}>
          <ActivityIndicator size="large" color='#c6affc' />
        </View>
        <View style={{ topMargin: 80 }}>
          <Text style={{ color:'#c6affc' }}>Loading Meal...</Text>
        </View>  
      </View>
    );
  }

  return (
    <View style={{ padding: 20, flex: 1 }}>
      {/* Date Input */}
        <Text style={styles.label}>Date</Text>
        <View style={styles.inputContainer}>
          
          <TextInput style={[styles.inputDate,styles.inputAll]}
            keyboardType='decimal-pad'
            placeholder='yyyy-mm-dd'
            editable={editableOr}
            onChangeText={(text) => handleInputChange("date", text)}
            //if it's a valid date, "validateDate" changes it to a text string.
            value={date}
            //value={(validateDate(date))}
            //value={(meal.date? validateDate(meal.date):validateDate(maxDate))}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") {
                setText((prevText) => prevText.slice(0, -1)); // Removes last character
              }
            }}
          />
          <IconButtonNoText style={{width: '20%'}}icon="pencil" size={20} color={pencilColor} onPress={() => makeDateEditable()}/>
          {/* <IconButtonNoText style={{width: '20%'}}icon="pencil" size={20} color={pencilColor} onPress={() => setShowPicker(true)}/> */}
        </View>
        {/* Show Date Picker if button is pressed */}
        {/* <Text style={{color:GlobalStyles.colors.primary50}}>Selected Date: {date2.toDateString()}</Text>
        <Button title="Open Date Picker" onPress={() => setOpen(true)}>Open Date Picker</Button>
        <DatePicker
          modal
          open={open}
          date={date2}
          mode="date"
          onConfirm={(selectedDate) => {
            setOpen(false);
            setDate2(selectedDate);
          }}
          onCancel={() => setOpen(false)}
        /> */}
      {/* Description Input */}
      <Input
        label="Description"
        textInputConfig={{
            multiline: true,
            // autoCapitalize: 'none'
            // autoCorrect: false // default is true
            onChangeText:((text) => handleInputChange("description", text)),
            value:meal.description
          }}
        />
      {/* <Input
        label="Group"
        textInputConfig={{
            multiline: false,
            editable: false,
            value: group?group:meal.group,
          }}
        /> */}
      
      {/* Grocery Items */}
      <FlatList
        data={meal.groceryItems}
        //keyboardShouldPersistTaps="handled"//I ended up using this on ScrollView a module up.
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View>
          <View style={styles.inputContainer}>
            <View style={styles.checkboxContainer}>
              {/* <Pressable onPress={() => handleGroceryCheckbox(index)} style={styles.checkbox}> */}
                <MaterialIcons  
                  size={24} 
                  color={GlobalStyles.colors.primary100}
                  //name={() =>handleGroceryCheckbox(index) ? "check-box" : "check-box-outline-blank"}
                  name={checked ? 'check-box' : 'check-box-outline-blank'}
                  onPress={() => setChecked(!checked)} // Toggle checkbox
                  />
              {/* </Pressable> */}
            </View>
            <TextInput style={[styles.inputQty,styles.inputAll]}
              keyboardType='numeric'
              placeholder="Qty"
              maxLength={3}
              onChangeText={(text) => handleGroceryChange(index, "qty", text)}
              value={item.qty?item.qty:qty}
            />
            <TextInput style={[styles.inputGrocery,styles.inputAll]}
              keyboardType='default'
              placeholder="Enter Grocery Item"
              maxLength={50}
              onChangeText={(text) => handleGroceryChange(index, "description", text)}
              value={item.description}
            />
            <TextInput style={{width:0,height: 35}}
              keyboardType='default'
              placeholder="Grocery Item Id"
              maxLength={20}
              editable={false}
              onChangeText={(text) => handleGroceryChange(index, "group", text)}
              value={group}
            />
            <IconButtonNoText
              icon="trash"
              size={20}
              color={GlobalStyles.colors.error500} 
              onPress={() => deleteGroceryItem(index,item.mealId,item.thisId?item.thisId:item.id)} />
          </View>
          {/* <Text style={styles.label}>{item.thisId}</Text> */}
          </View>
          
        )}
      />
      {errorMessage?<Text style={styles.errorText}>{errorMessage}</Text>:null}
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>Enter Grocery Item</Text>
              <View style={styles.buttons}>
                <TextInput  style={[styles.inputQty2,styles.inputAll2]}
                  //style={styles.input2}
                  placeholder="Qty"
                  keyboardType='numeric'
                  maxLength={3}
                  value={qty}
                  onChangeText={(text)=>setQty(text)}
                />
                <TextInput
                  style={styles.input2}
                  placeholder="Description"
                  value={groceryDescription}
                  onChangeText={(text)=>setGroceryDescription(text)}
                />
              </View>
              
              <View style={styles.buttons}>
                <Button 
                  onPress={()=>handleAddMeal({checkedOff:"", qty: qty, description: groceryDescription, group: group?group:groupUsing})}
                  style={{marginTop:8}}
                  >Back to {submitButtonLabel}</Button>
                <Button style={{marginLeft:8,marginTop:8}} onPress={() => setModalVisible(false)}>Cancel</Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.buttons}>
        {/* Add Grocery Item Button only shows when updating meal */}
        {isAddGroceryVisible && (<Button onPress={() => add1GroceryItem()}>Add Grocery Item</Button>)}
        {/* New Grocery Item Button only shows when adding new meal */}
        {isNewGroceryVisible && (<Button onPress={()=>addGroceryItem(defaultGroceryItem)}>New Grocery Item</Button>)}
        {/* Save/Update Button */}
        <Button style={{marginLeft:8}} onPress={() => saveMeal(meal)}>{submitButtonLabel}</Button>
      </View>
      
    </View>
  );
}

const styles = {
  label: {
    fontSize: 12,
    color: GlobalStyles.colors.primary100,
    marginBottom: 4,
    marginLeft: 4,
  },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: GlobalStyles.colors.primary100, },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: GlobalStyles.colors.primary50, borderRadius: 10 },
  input2: { width: "85%",borderBottomWidth: 1, marginBottom: 4, padding: 5 },
  inputQty2: { width: '15%', height: 35, marginRight: 8,
  },
  inputAll2: {
    //backgroundColor: GlobalStyles.colors.primary100,
    color: GlobalStyles.colors.primary700,
    padding: 6,
    paddingTop: 8,
    borderRadius: 6,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    textAlign: 'center',
    color: GlobalStyles.colors.error500,
    margin: 8,
  },
  rowInput: {
    flex: 1,
  },
  inputGrocery: {
    width: '69%',
    //marginRight: 8,
  },
  inputItemId: {
    width: '8%',
    marginRight: 8,
  },
  inputQty: {
    width: '15%',
    marginRight: 8,
  },
  
  inputDate:{
    width: '60%',
    marginLeft: 4,
  },
  inputContainer:{
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 4
  },
  inputAll: {
    backgroundColor: GlobalStyles.colors.primary100,
    color: GlobalStyles.colors.primary700,
    padding: 6,
    borderRadius: 6,
    fontSize: 18,
    marginTop: 4,
  },
  buttons:{flexDirection:'row',justifyContent: 'center'},
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
  },
  checkbox: {
    marginRight: 0,

  },
};
