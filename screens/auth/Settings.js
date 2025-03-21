import React, { useEffect, useState, useCallback, useContext, memo, useMemo } from 'react';
import {View, Text, StyleSheet, Pressable, FlatList, TextInput, Alert, Modal, ScrollView, Keyboard, TouchableWithoutFeedback  } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from "@react-navigation/native";
//import { ScrollView } from 'react-native-virtualized-view'

import Footer from "../../components/Footer";
import { GlobalStyles } from '../../constants/styles';
import Button from '../../components/UI/Button';
import { useEmail } from '../../store/email-context';
import storeValue, { getValue} from '../../util/useAsyncStorage';
import { MealsContext } from '../../store/meals-context';
import { ListsContext } from '../../store/lists-context';
import { fetchLists } from '../../util/http-list';
import { fetchMeals } from '../../util/http';
import InputSettings from '../../components/Auth/InputSettings';
const BACKEND_URL = 'https://justinhlottcapstone-default-rtdb.firebaseio.com';

//stores user info to firebase online.
export async function storeGroup(newGroup) {
  const response = await axios.post(BACKEND_URL + '/groups.json', newGroup);
  const id = response.data.name;
  return id;
}

export async function updateGroup(groupId, updatedGroup){
    //update firebase with new mealData
    const updatedMeal = await axios.put(BACKEND_URL + `/groups/${groupId}.json`, updatedGroup);
    return updatedMeal;
}

export function deleteGroupFromFirebase(id) {
    return axios.delete(BACKEND_URL + `/groups/${id}.json`);
  }

export const fetchGroupsByEmail = async (email) => {
    try {
      const response = await axios.get(BACKEND_URL + '/groups.json', email);
      const data = response.data;
  
      if (!data) return [];
  
      // Convert object to array and filter by email
      const groups = Object.keys(data)
        .map((key) => ({ id: key, ...data[key] }))
        .filter((group) => group.email === email);
        //console.log("Settings fetch groups1:",groups);
      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  };

  export const fetchAllGroups = async () => {
    try {
      const response = await axios.get(BACKEND_URL + '/groups.json');
      //const data = response.data;
  
      if (!response.data) {
        return [];
      }else{
        return response.data;
      }
    }catch(error){
      console.error('Error fetching all groups:', error);
      return [];
    }
  };

const RadioButtonWithDelete = React.memo(({ label, selected, itemId, accountOrGroup, onPress, onDelete, deleteYN }) => {
    // console.log("settings label:",label);
    // // console.log("settings selected:",selected)
    // console.log("settings itemId:",itemId);
    // console.log("settings accountOrGroup:",accountOrGroup)
    let selected2=false;
    if(selected){
        selected2 = true;
        //console.log("settings true:",selected2)
    }else if(itemId===accountOrGroup){
        selected2 = true;
        //console.log("settings true_j:",selected2)
    }
    return(
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 0, marginLeft: 15 }}>
      {/* Radio Button */}
      <Pressable
        //onPress={() => setSelectedOption(label)}
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1, // Ensures text takes available space
        }}
      >
        <View
          style={{
            height: 14,
            width: 14,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: selected2 ? 'blue' : 'blue',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          {selected2 && <View style={{ height: 7, width: 7, borderRadius: 3.5,
            backgroundColor: 'blue' }} />}
        </View>
        <Text style={{ fontSize: 13, color: GlobalStyles.colors.primary800 }}>{label}</Text>
      </Pressable>
  
      {/* Delete Button */}
      {deleteYN??
      <Pressable onPress={onDelete} style={{ marginLeft: 10 }}>
        <Text style={{ color: 'red', fontSize: 16, marginRight:100 }}>❌</Text>
      </Pressable>
      }
      
    </View>
    )
});


//This goes in the AuthContent.  Includes all the input boxes for signin/login
export default function Settings({ route, navigation }){
//function AuthForm({ isLogin, onSubmit, credentialsInvalid }) {
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [selectedAccount, setSelectedAccount] = useState("shared");

  const [firstTime, setFirstTime] = useState(true);
  const [selectedGroupName,setSelectedGroupName] = useState(null);
  const [creatingNewGroup, setCreatingNewGroup] = useState(false);
  const [addNewEmail, setAddNewEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedOption, setSelectedOption] = useState("personal");
  const { emailAddress, setEmailAddress } = useEmail();
  const {groupUsing, setGroupUsing} = useEmail();
  const [ groupOrGroups, setGroupOrGroups ] = useState(true);
  const { inputValue, setInputValue} = useState();
  const [group, setGroup] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [groups, setGroups] = useState(null);
  const [modalVisible,setModalVisible]=useState(false);
  const [idToDelete,setIdToDelete]=useState(false);
  const [seeScrollViews,setSeeScrollViews]=useState(true);

  const [accounts, setAccounts] = useState([
      { id: 'personal', label: 'Personal Account' },
      { id: 'shared', label: 'Shared Account' },
  ]);
  

  const mealsCtx = useContext(MealsContext);
  const listsCtx = useContext(ListsContext);

  useFocusEffect(
      useCallback(() => {
          setFirstTime(true);
      }, [])
  );

  if(firstTime===true){
      //console.log("Settings firstTime")
      setFirstTime(false);
      const accntType = pullAcountTypeChosen();
      setSelectedAccount(accntType);
      setGroupId(pullGroupChosen());
      //console.log("settings firsttime account:",selectedAccount?selectedAccount.value:null);
      setSelectedGroupName(getValue(emailAddress+"groupName"));
  }

  function updateInputValueHandler(inputType, enteredValue) {
    switch (inputType) {
      case 'email':
        setEnteredEmail(enteredValue);
        break;
      case 'password':
        setNewGroupName(enteredValue);
        break;
    }
  }

  async function pullAcountTypeChosen(){
    const accountTypeChosen = await getValue(emailAddress+"accountTypeChosen");
    return accountTypeChosen;
  }

  async function pullGroupChosen(){
      const chosenGroup = await getValue(emailAddress+"groupChosen");
        console.log("settings pullGroupChosen:",chosenGroup?chosenGroup:groupUsing)
        return chosenGroup?chosenGroup:groupUsing;
  }

  async function fetchGroup(){//pulls the group associated with the login email
      const theGroups = await fetchGroupsByEmail(emailAddress);

      //when true only the personal group is shown.
      setGroupOrGroups(true);
      //filter out all but personal group (group === email)
      setGroup(theGroups.filter((item) => item.email === emailAddress && item.group === emailAddress));
      const theGroup = theGroups.filter((item) => item.email === emailAddress && item.group === emailAddress);
      console.log("TheGroup",theGroup[0].id)
      await storeValue(emailAddress+"groupChosen",theGroup[0].id);
      //console.log("Settings fetched group:",group);

  }

  async function fetchGroups(){//pulls all of the groups associated with the login email
      try{
          const theGroups = await fetchGroupsByEmail(emailAddress);
          //console.log("Settings theGroups",theGroups);
          //set Group equal to the personal group incase it is needed for deletion of the active shared group.
          setGroup(theGroups.filter((item) => item.email === emailAddress && item.group === emailAddress));
          //filters groups to only see those that have your email & excludes your personal group.
          const allGroups = Object.keys(theGroups)
          .map((key) => ({ id: key, ...theGroups[key] }))
          .filter((group1) => group1.email === emailAddress && group1.group !== group1.email);
          //when false, all groups are shown.
          setGroupOrGroups(false);
          //set groups as all groups with my email.
          setGroups(allGroups)
      }catch(error){
          console.log("Settings fetchGroups error:",error)
      }finally{
          console.log("Settings groups:",groups)
      }
      
  }

  //this runs when you select one of option buttons; shared or personal.
  async function chooseAccount(id,label){
    //example of id   ==="shared"
    //example of label==="Shared Account"
    //this function uses data that is hardcoded at the top of this screen as "accounts."
    if(id==="shared"){
        fetchGroups();//this is used to filter for your groups meals
        await storeValue(emailAddress+"accountTypeChosen","shared")
    }else{
        fetchGroup();//this is used to filter for your personal meals
        await storeValue(emailAddress+"accountTypeChosen","personal");
        await storeValue(emailAddress+"groupName",label);
        //await storeValue(emailAddress+"groupChosen",emailAddress);  //Do this in SetGroup.
        //setGroup(emailAddress);                                       //Do this in SetGroup.
        setSelectedGroupName(emailAddress);
    }
    setSelectedAccount(id);
    setSelectedOption(id);
  }

  async function addNewEmail2(){
    const emailIsValid = enteredEmail.includes('@','.');
    if(emailIsValid){
      if(selectedAccount==="shared"&&selectedGroupName!==emailAddress){
        console.log(enteredEmail)//newEmail

        
        console.log("Settings selectedGroupName:",selectedGroupName);
        const newEmailGroup = {
            group: selectedGroupName,
            groupId: groupId,
            email: enteredEmail,
        }

        if(selectedGroupName==='Personal Account'){
          Alert.alert("You must select a shared Group before pushing the group to a different user email.")
        }else{
          //Show the radio buttons again
          setSeeScrollViews(true)
          //function in settings to store the group for the specified email address.
          doStoreGroupForEmail(newEmailGroup); 
          //reset the email textbox.
          setEnteredEmail(null);
        }
      }
    }else{
      Alert.alert("You must enter a valid email address");
    }
    
    
    
  }

  async function doStoreGroupForEmail(newEmailGroup){
    const id = await storeGroup(newEmailGroup)
    .then((result)=>{
      Alert.alert("New user email has been given access to account, "+selectedGroupName)
      //groupId needs to be the shared id for the group.
      const newEmail2={...newEmailGroup,id: result?result:groupUsing};
      console.log("Settings newGroup2",newEmail2);
      updateGroup(result, newEmail2);
      //setAddNewEmail(false); 
    },[])
  }

  async function createNewGroup2(){
    let groupsMatched=0;
    let notImportant=0;
    //Show the radio buttons again
    setSeeScrollViews(true)
    //check to see if the group name is already being used?
    if(newGroupName===emailAddress){
      groupsMatched = 1;
      Alert.alert("Must choose a different group name.");
      return;
    }else{
      console.log("groups",groups)
      groups.map((grp)=>{
        if(grp.group===newGroupName){
          console.log("settings grp:",grp.group)
          console.log("settings grp new:",newGroupName)
          groupsMatched = 1;
          return;
        }

        grp.group===newGroupName?groupsMatched = 1:notImportant = 1;
      })
      
      console.log("groups matched:",groupsMatched)

      //if the name hasn't been used, continue.
      if(groupsMatched===0){
        const newGroup = {
            group: newGroupName,
            email: emailAddress,
        }

        //store in firebase
        const id = await storeGroup(newGroup);
        Alert.alert("New account group,"+newGroupName+", created");
        const newGroup2={...newGroup,id: id, groupId: id}
        //console.log("Settings newGroup2",newGroup2);

        //update firebase
        updateGroup(id, newGroup2);

        //update the state
        let newGroups = groups;
        newGroups.push(newGroup2);
        setGroups(newGroups);
        setCreatingNewGroup(false);
        //reset the group state
        setNewGroupName('');
      }else{
        Alert.alert("Must choose a different group name.");
      };
      //reset the text in the new account textbox.
      setNewGroupName(null);
    };
  };

  // Function to delete a group option
  const deleteGroup = (id) => {
      setIdToDelete(id);
      //This shows the modal that allows you to permanently delete a group.
      setModalVisible(true);
  };

  async function  deleteGroup2(){
    console.log("personal group:",group[0])
      setGroups((prev) => prev.filter((item) => item.groupId !== idToDelete));
      // Reset if deleted option was selected
      if (groupId === idToDelete){
        //this sets the state id to be that of the personal group.
        setGroupId(group?group[0].groupId:groupUsing);
        setGroupUsing(group?group[0].groupId:groupUsing);
        await storeValue(emailAddress+"groupChosen",group?group[0].groupId:groupUsing);
        //this sets the group name on the phone to be the personal email address.
        await storeValue(emailAddress+"groupName",group?group[0].group:groupUsing);
      }
        
      //also delete group from firebase
      deleteGroupFromFirebase(idToDelete);
      setIdToDelete(false);
      setModalVisible(false);
  };

  //select the group that will be used.
  async function selectGroup(id,name,groupId){
      //set group in state
      setGroupId(groupId);
      setSelectedGroupName(name);
      //set group in email context
      // setGroupUsing(id);//(it's not used anywhere else.)
      // console.log("Settings group using:",groupUsing);
      await storeValue(emailAddress+"groupChosen",groupId);
      //console.log("Settings groupId:",groupId);
      await storeValue(emailAddress+"groupName",name);
  }

  async function saveSettings(){
    //fetch meals & grocery items & filter for account.
    //fetch grocery items

    try {
        //setFirstTime(true);
        //console.log("Makes it to save settings");
        const items = await fetchLists();
        const meals = await fetchMeals();
        ///console.log("settings list in GroceryList: ")
    
        pullGroupChosen()
            .then((result)=>{
                //console.log("RecenetMeals groupChosen:",result);
                let allItems = [];
                let allMeals = [];
        
                //build an array of grocery items for the specified group.
                items.map((item)=>{
                //console.log("RecentMeals mapped group:",meal)
                if(item.group === result){
                    allItems.push(item);
                }
                })

                //build an array of meals for the specified group.
                meals.map((meal)=>{
                    //console.log("settins result stored-----------------------------------:",result);
                    //console.log("Settings mapped group-----------------------------------:",meal.group)
                    if(meal.group === result){
                        
                        allMeals.push(meal);
                        mealsCtx.addMeal(meal);
                    }
                })

                if(typeof allItems ==='object'){
                    listsCtx.setLists(allItems);
                }
                if(typeof allMeals ==='object'){
                    mealsCtx.setMeals(allMeals);
                }
            })
        } catch (error) {
          console.log(error);
          setError('Could not fetch lists!');
        } finally {
            //setFirstTime(false);
        }
    navigation.goBack()
  }

  const memoizedGroup = useMemo(() => group, [group]); // Prevents re-renders if group hasn’t changed
  const memoizedGroups = useMemo(() => groups, [groups]); // Prevents re-renders if groups hasn’t changed

  //const groupSelection = React.memo(({ groupOrGroups,memoizedGroup,memoizedGroups}) => {
  function groupSelection(groupOrGroups,memoizedGroup,memoizedGroups){
      return(
          <View>
              <Text style={[styles.textHeader,{marginTop: 8, marginBottom: 2 }]}>Select Account:</Text>
              <FlatList
                  data={groupOrGroups?memoizedGroup:memoizedGroups}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                  <RadioButtonWithDelete
                      label={item.group}
                      selected={groupId === item.groupId}//2025-03-17
                      //selected={group === item.groupId}
                      itemId={item.id}
                      accountOrGroup={groupId}
                      onPress={() => selectGroup(item.id,item.group,item.groupId)}
                      onDelete={() => deleteGroup(item.id)}
                  />
                  )}
              />
          </View>
      )
  };

  function handleOnFocus(){
    //This hides both radio button groups when you start typing in an input box
    setSeeScrollViews(false);
  }
  function noSelection(){
      return(<View></View>)
  };
  function doNothing(){
      Alert.alert("You must first select a specific shared account.")
  };
  function doNothingGroups(){
      Alert.alert("You must first select the shared account option button.")
  };

  return (
    <View style={styles.topView}>
      <View style={styles.topView}>

        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          {/* Account Type Selection */}
          <View style={{flexDirection:'row'}}>
              <Text style={[styles.textHeader,{ marginBottom: 5 }]}>Select Account Type: </Text>
          <Text style={[styles.textHeader2,{ paddingTop: 2 }]}> current group = </Text>
          <Text style={[styles.textHeader2,{ paddingTop: 2, textDecorationLine: 'underline' }]}>{selectedGroupName}</Text>
          </View>
          <Text style={[styles.textHeader2,{ paddingTop: 0 }]}>NOTE: with personal account selected, only meals created by this account, {emailAddress}, will be visible.  With shared accounts, your meals will be created on the shared account and can be shared with others.</Text>
          {/* <FlatList
              data={accounts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
              <RadioButtonWithDelete
                  label={item.label}
                  //selected={selectedAccount === item.optionChosen}
                  selected={item.id === selectedAccount}
                  itemId={item.id}
                  accountOrGroup={selectedAccount}
                  onPress={() => chooseAccount(item.id,item.label)}
                  //onDelete={() => deleteGroup(item.id)}
                  deleteYN={false}
              />
              )}
          /> */}
          {!seeScrollViews&&
            <Button style={{justifyContent:"left",alignItems:'left',marginLeft: 0,marginTop:5, marginBottom: 4}}
              onPress={()=>setSeeScrollViews(true)}>View Radio Buttons Again
            </Button>
          }
          {seeScrollViews&&
          <ScrollView>
            {accounts.map((item) => (
              <RadioButtonWithDelete
                key={item.id} // Ensure unique key for React rendering
                label={item.label}
                selected={item.id === selectedAccount}
                itemId={item.id}
                accountOrGroup={selectedAccount}
                onPress={() => chooseAccount(item.id, item.label)}
                deleteYN={false}
              />
            ))}
          </ScrollView>
}
          {selectedAccount==="shared"&&seeScrollViews? groupSelection(groupOrGroups,memoizedGroup,memoizedGroups):noSelection()}
          <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
          >
              <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                      <Text style={[styles.textHeader,{ marginBottom: 10 }]}>Are you sure you want to permanently delete your connection to this group?</Text>
                      <View style={styles.buttons}>
                      <Button 
                          onPress={deleteGroup2}
                          style={{marginTop:8}}
                          >Delete Group</Button>
                      <Button style={{marginLeft:8,marginTop:8}} onPress={() => setModalVisible(false)}>Cancel</Button>
                      </View>
                  </View>
              </View>
          </Modal>
          <View>

            <View>
              <Text style={[styles.textHeader2,{ marginTop: 8 }]}>To add another person to your shared account:</Text>
              <Text style={[styles.textHeader2,{ marginLeft: 8 }]}> (1) Select "Shared account"</Text>
              <Text style={[styles.textHeader2,{ paddingLeft: 8 }]}> (2) Select account then enter email to share.</Text>
              <Text style={[styles.textHeader2,{ marginLeft: 8 }]}> (3) Press the "Add new Email" button.</Text>
              <View style={{flexDirection: 'row'}}>
                
                  <InputSettings
                    onUpdateValue={updateInputValueHandler.bind(this, 'email')}//onChangeText={(text) => handleTextChange(text, "email")}
                    value={enteredEmail}//value={newEmail}
                    keyboardType="email-address"
                    placeholder="New Email Address"
                    onFocus={handleOnFocus}
                  />
                  <Button style={{marginTop:2}}
                      onPress={addNewEmail2}>Add New Email
                  </Button>
                  
              </View>
            </View>
            <View>
              <Text style={[styles.textHeader2,{ marginTop: 8 }]}>To create a new shared account:</Text>
              <Text style={[styles.textHeader2,{ marginLeft: 8 }]}>(1) Select "Shared account"</Text>
              <Text style={[styles.textHeader2,{ marginLeft: 8 }]}>(2) Type name of new shared account below</Text>
              <Text style={[styles.textHeader2,{ marginLeft: 8 }]}>(3) Press "Create Shared Acct" button.</Text>
              <View style={{flexDirection: 'row'}}>
                  <InputSettings
                    onUpdateValue={updateInputValueHandler.bind(this, 'password')}//onChangeText={(text) => handleTextChange(text, "group")}
                    value={newGroupName}//value={newGroupName}
                    placeholder="New Group Name"
                    onFocus={handleOnFocus}
                  />
                  <Button style={{marginTop:2}}
                      onPress={selectedAccount==="shared"?createNewGroup2:doNothingGroups}>Create Shared Acct
                  </Button>
              </View>
            </View>

          </View>
        </View>
      </View>
      <View style={{backgroundColor:GlobalStyles.colors.primary50}}>
        <Button 
            style={{justifyContent:"center",alignItems:'center',flexDirection: 'row',marginBottom: 8}}
            onPress={saveSettings}
            >Save Settings</Button>
      </View>
      <View style={styles.footer}>
        <Footer/>
      </View>
    </View>
  );
}

//export default AuthForm;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    margin: 2,
    backgroundColor: GlobalStyles.colors.primary800,
    elevation: 2,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    color: GlobalStyles.colors.primary50,
  },

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: 300, padding: 20, backgroundColor: GlobalStyles.colors.primary50, borderRadius: 10 },
    buttons:{flexDirection:'row',justifyContent: 'center'},
    topView:{
        flex: 1,
        backgroundColor: GlobalStyles.colors.primary50,
    },
    text:{
        color: GlobalStyles.colors.primary800,
        fontSize: 13
    },
    textHeader:{
        color: GlobalStyles.colors.primary800,
        fontWeight: 'bold',
        fontSize: 15
    },
    textHeader2:{
        color: GlobalStyles.colors.primary800,
        fontSize: 13
    },
    footer:{
        backgroundColor: GlobalStyles.colors.primary500,
        paddingTop: 3,
        paddingBottom: 4,
        paddingRight: 20,
    },
});
