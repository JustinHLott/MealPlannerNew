import { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput,Alert } from 'react-native';

import { MealsContext } from '../../store/meals-context';
import Input from './Input';
import Button from '../UI/Button';
//import { getFormattedDate } from '../../util/date';
import { GlobalStyles } from '../../constants/styles';
import { getFormattedDate } from "../../util/date";
import { useEmail } from "../../store/email-context";

//defaultMealDesc={selectedMeal.description}
function GroceryForm({ submitButtonLabel, onCancel, onSubmit, defaultValues, group }) {
  //console.log("defaultValues in GroceryForm", defaultValues);
  const [date, setDate] = useState();
  const [descriptionIsValid,setDescriptionIsValid]=useState(true);
  const [qtyIsValid,setQtyIsValid]=useState(true);
  const {groupUsing, setGroupUsing} = useEmail();
  const [inputs, setInputs] = useState({
    qty: {
      value: defaultValues ? defaultValues.qty : 1
    },
    description: {
      value: defaultValues ? defaultValues.description : ''
    },
    checkedOff: {
      value: defaultValues ? defaultValues.checkedOff : ''
    },
    thisId: {
      value: defaultValues ? defaultValues.thisId : ''
    },
    id: {
      value: defaultValues ? defaultValues.id : ''
    },
    mealId: {
      value: defaultValues ? defaultValues.mealId : ''
    },
    mealDesc: {
      value: defaultValues ? defaultValues.mealDesc : ''
    },
    group:{
      value: defaultValues? defaultValues.group : ''
    }
  });

  const mealsCtx = useContext(MealsContext);

  //This runs once when the page first loads
  useEffect(()=>{
    console.log("GroceryForm useEffect defaultValues:",defaultValues);
    const kjl = typeof defaultValues;
    console.log("the type:",kjl);
    if(typeof defaultValues==="string"||typeof defaultValues==="undefined"){
      console.log("GroceryForm no meal");
    }else{
      if(!defaultValues.description){
        setDate("NO DATE");
      }else{
        const meal = mealsCtx.meals.find((meal) => meal.id === defaultValues.mealId);
        console.log("GroceryForm useEffect meal",meal);
        if(!meal){
          setDate("NO DATE");
        }else{
          setDate(getFormattedDate(meal.date));
        }
      }
    }
  },[])
  
  

  function inputChangedHandler(inputIdentifier, enteredValue) {
    setInputs((curInputs) => {
      return {
        ...curInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true },
      };
    });
    if(enteredValue==="qty"&& !inputs.qty){
      setQtyIsValid(false);
    }else{
      setQtyIsValid(true);
    }
    if(enteredValue==="description"&& !inputs.description){
      setDescriptionIsValid(false);
    }else{
      setDescriptionIsValid(true);
    }
  }

  //console.log("inputs.mealDesc",inputs.mealDesc);

  function submitHandler() {
    const groceryData = {
      qty: inputs.qty.value,
      description: inputs.description.value,
      mealId: inputs.mealId.value,
      mealDesc: inputs.mealDesc.value,
      id: inputs.id.value,
      thisId: inputs.thisId.value,
      checkedOff: inputs.checkedOff.value,
      group: group?group:groupUsing,
    };

       
    if(!inputs.description.value){
      console.log("no description")
      setDescriptionIsValid(false)
      Alert.alert('Invalid input', 'You must enter a description')
      console.log("Made it to if", inputs)
    }else{
      console.log("has description")
      setDescriptionIsValid(true);
      if(!inputs.qty.value){
        setQtyIsValid(false);
        Alert.alert('Invalid input', 'You must enter a quantity')
      }else{
        setQtyIsValid(true);
        console.log("GroceryForm submit:", groceryData);
        onSubmit(groceryData);
      }
      
    }
  }

  const formIsInvalid =
    !qtyIsValid ||
    !descriptionIsValid;

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Your Grocery Item</Text>
      <View style={styles.inputsRow}>
        {/* Meal Desc */}
        <Text style={styles.label}>Meal</Text>
        <View style={styles.inputContainer}>
          <TextInput style={[styles.inputDate,styles.inputAll]}
            placeholder='No meal associated'
            editable={false}
            //if it's a valid date, "validateDate" changes it to a text string.
            //value={inputs.mealId.value}
            value={inputs.mealDesc.value}
          />
        </View>
        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <View style={styles.inputContainer}>
          <TextInput style={[styles.inputDate,styles.inputAll]}
            placeholder='No Date'
            editable={false}
            //if it's a valid date, "validateDate" changes it to a text string.
            //value={inputs.mealId.value}
            value={date}
          />
        </View>
        {/* MealId
        <Text style={styles.label}>Meal ID</Text>
        <View style={styles.inputContainer}>
          <TextInput style={[styles.inputDate,styles.inputAll]}
            placeholder='No meal ID'
            editable={false}
            //if it's a valid date, "validateDate" changes it to a text string.
            //value={inputs.mealId.value}
            
            value={inputs.mealId.value}
          />
        </View>
        <Text style={styles.label}>Grocery Id</Text>
        <View style={styles.inputContainer}>
          <TextInput style={[styles.inputDate,styles.inputAll]}
            placeholder='No grocery ID'
            editable={false}
            //if it's a valid date, "validateDate" changes it to a text string.
            //value={inputs.mealId.value}
            value={inputs.thisId.value}
          />
        </View> */}
        <Input
          style={styles.rowInput}
          label="Quantity"
          invalid={!qtyIsValid}
          textInputConfig={{
            keyboardType: 'decimal-pad',
            placeholder: '0',
            maxLength: 3,
            onChangeText: inputChangedHandler.bind(this, 'qty'),
            value: inputs.qty.value,
          }}
        />
      </View>
      <Input
        label="Description"
        invalid={!descriptionIsValid}
        textInputConfig={{
          multiline: true,
          onChangeText: inputChangedHandler.bind(this, 'description'),
          value: inputs.description.value,
        }}
      />
      {formIsInvalid && (
        <Text style={styles.errorText}>
          Invalid input values - please check your entered data!
        </Text>
      )}
      <View style={styles.buttons}>
        <Button style={styles.button} mode="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button style={styles.button} onPress={submitHandler}>
          {submitButtonLabel}
        </Button>
      </View>
    </View>
  );
}

export default GroceryForm;

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: GlobalStyles.colors.primary100,
    marginBottom: 0,
    marginLeft: 8,
  },
  inputDate:{
    width: '98%',
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
  form: {
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GlobalStyles.colors.primary50,
    marginVertical: 24,
    textAlign: 'center',
  },
  inputsRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  rowInput: {
   // flex: 1,
  },
  errorText: {
    textAlign: 'center',
    color: GlobalStyles.colors.error500,
    margin: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    minWidth: 120,
    marginHorizontal: 8,
  },
});
