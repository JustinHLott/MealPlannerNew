// import { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, FlatList, TextInput } from 'react-native';

// import Input from './Input';
// import Button from '../UI/Button';
// import { getFormattedDate } from '../../util/date';
// import { GlobalStyles } from '../../constants/styles';

// function MealForm({ submitButtonLabel, onCancel, onSubmit, defaultValues, defaultDate }) {
//   const [groceryList, setGroceryList] = useState(defaultValues); // List of grocery items
//   const [groceryItems, setGroceryItems] = useState([]); // List of grocery items
//   const [inputs, setInputs] = useState({
//     date: {
//       value: defaultValues ? getFormattedDate(defaultValues.date) : defaultDate.toISOString().slice(0, 10),
//       isValid: true,
//     },
//     description: {
//       value: defaultValues ? defaultValues.description : '',
//       isValid: true,
//     },
//     groceryItems: {
//       value: defaultValues ? defaultValues.groceryItems: []
//     }
// });

//   function inputChangedHandler(inputIdentifier, enteredValue) {
//     setInputs((curInputs) => {
//       console.log(enteredValue)
//       return {
//         ...curInputs,
//         [inputIdentifier]: { value: enteredValue, isValid: true },
//       };
//     });
//   }

//   // Function to add a new grocery item input
//   const addGroceryItem = () => {
//     setGroceryItems([...groceryItems, { description: "", qty: "" }]);
//   };

//   function addGroceryList(inputs){
//     console.log("MealForm return--AddGroceryList")

//     if(defaultValues && groceryItems === ""){
//       //setGroceryItems([]);
//       Object.entries(defaultValues.groceryItems).map(([mealkey,meal])=>{
//           //addGroceryItem()
//           groceryItems.push({index: mealkey, description: meal.description, qty: meal.qty})
//           console.log(meal.description + " " + meal.qty);
//         }
//       )


//     //if (inputs || Array.isArray(inputs) || inputs.length > 0){
//       return(
//       <FlatList
//         data={groceryItems}
//         keyExtractor={(_, index) => index.toString()}
//         renderItem={({ item, index }) => (
//           <View style={styles.inputContainer}>
//             <TextInput style={[styles.inputQty,styles.inputAll]}
//               keyboardType='numeric'
//               placeholder="Enter Qty"
//               maxLength={3}
//               onChangeText={(text) => updateGroceryItem(index, "qty", text)}
//               value={item.qty}
//             />
//             <TextInput style={[styles.inputGrocery,styles.inputAll]}
//               keyboardType='default'
//               placeholder="Enter Grocery Item"
//               maxLength={50}
//               onChangeText={(text) => updateGroceryItem(index, "description", text)}
//               value={item.description}
//             />
//           </View>
//         )}
//       />
//       )
//     }
//   }

//   // Function to update a specific grocery item
//   const updateGroceryItem = (index, key, value) => {
//     const updatedItems = [...groceryItems];
//     updatedItems[index][key] = value;
//     console.log(updatedItems);
//     setGroceryItems(updatedItems);
//   };

//   function submitHandler() {
//     // const mealData = {
//     //   date: new Date(inputs.date.value),//defaultDate,//
//     //   description: inputs.description.value,
//     //   groceryItems: inputs.groceryItems.value,
//     // };
//     const mealData = {
//       date: new Date(inputs.date.value),//defaultDate,//
//       description: inputs.description.value,
//       groceryItems: groceryItems.filter(item => item.description.trim() && item.qty.trim()), // Remove empty entries
//     };

//     const dateIsValid = mealData.date.toString() !== 'Invalid Date';
//     const descriptionIsValid = mealData.description.trim().length > 0;

//     if (!dateIsValid || !descriptionIsValid) {
//       // Alert.alert('Invalid input', 'Please check your input values');
//       setInputs((curInputs) => {
//         return {
//           date: { value: curInputs.date.value, isValid: dateIsValid },
//           description: {
//             value: curInputs.description.value,
//             isValid: descriptionIsValid,
//           },
//           groceryItems: { value: curInputs.groceryItems },
//         };
//       });
//       return;
//     }

//     onSubmit(mealData)
//     .then(() => {
//       alert("Meal saved!");
//       setMeal(""); // Reset meal name
//       setGroceryItems([]); // Clear grocery items
//     });
//   }



//   const formIsInvalid =
//     !inputs.date.isValid ||
//     !inputs.description.isValid;

//    return (
//     <View style={styles.form}>
//       {console.log("MealForm return--")}
//       {/*console.log(inputs.groceryItems)*/}
      
//       <Text style={styles.title}>Your Meal</Text>
//       <View style={styles.inputsRow}>
//         <Input
//           style={styles.rowInput}
//           label="Date"
//           invalid={!inputs.date.isValid}
//           editable={false}//this is supposed to make it disabled
//           selectTextOnFocus={false}//this is supposed to make it so you can't select the text
//           textInputConfig={{
//             keyboardType: 'decimal-pad',
//             placeholder: 'yyyy-mm-dd',//defaultDate.toISOString().slice(0, 10),
//             maxLength: 10,
//             onChangeText: inputChangedHandler.bind(this, 'date'),
//             value: inputs.date.value,//dateToUse,//defaultDate.toISOString().slice(0, 10),//
//           }}
//         />
//       </View>
//       <Input
//         label="Description"
//         invalid={!inputs.description.isValid}
//         textInputConfig={{
//           multiline: true,
//           // autoCapitalize: 'none'
//           // autoCorrect: false // default is true
//           onChangeText: inputChangedHandler.bind(this, 'description'),
//           value: inputs.description.value,
//         }}
//       />
//       <Text style={styles.groceryTitle}>Associated Grocery Items</Text>
//       {addGroceryList(inputs)}
//       {formIsInvalid && (
//         <Text style={styles.errorText}>
//           Invalid input values - please check your entered data!
//         </Text>
//       )}
//       <View style={styles.buttons}>
//         <Button style={styles.button} mode="flat" onPress={onCancel}>
//           Cancel
//         </Button>
//         <Button style={styles.button} onPress={submitHandler}>
//           {submitButtonLabel}
//         </Button>
//       </View>
//     </View>
//   );
// }

// export default MealForm;

// const styles = StyleSheet.create({
//   form: {
//     marginTop: 0,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: GlobalStyles.colors.primary50,
//     marginVertical: 8,
//     textAlign: 'center',
//   },
//   groceryTitle: {
//     fontSize: 20,
//     //fontWeight: 'bold',
//     color: GlobalStyles.colors.primary50,
//     marginTop: 8,
//     marginBottom: 0,
//     textAlign: 'center',
//   },
//   inputsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   rowInput: {
//     flex: 1,
//   },
//   groceryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 0,
//   },
//   groceryInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "gray",
//     padding: 2,
//     marginRight: 5,
//     borderRadius: 5,
//   },
//   errorText: {
//     textAlign: 'center',
//     color: GlobalStyles.colors.error500,
//     margin: 8,
//   },
//   buttons: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   button: {
//     minWidth: 120,
//     marginHorizontal: 8,
//   },
//   inputGrocery: {
//     width: '73%',
//     //marginRight: 8,
//   },
//   inputQty: {
//     width: '25%',
//     marginRight: 8,
//   },
//   inputContainer:{
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   inputAll: {
//     backgroundColor: GlobalStyles.colors.primary100,
//     color: GlobalStyles.colors.primary700,
//     padding: 6,
//     borderRadius: 6,
//     fontSize: 18,
//     marginTop: 4,
//   },
// });
