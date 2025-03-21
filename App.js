import {useState, useContext, useEffect} from 'react'
import {Alert} from 'react-native'
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import Settings from './screens/auth/Settings';
import AuthContextProvider, { AuthContext } from './store/auth-context';
import LogOut from './screens/LogOut';
import ManageMeal from './screens/ManageMeal';
import ManageGroceryItem from './screens/ManageGroceryItem';
import RecentMeals from './screens/RecentMeals';
import AllMeals from './screens/AllMeals';
import GroceryList from './screens/GroceryList';
import { GlobalStyles } from './constants/styles';
import IconButton from './components/UI/IconButton';
import MealsContextProvider from './store/meals-context';
import ListsContextProvider from './store/lists-context';
import { EmailProvider } from './store/email-context'; // Import the context
import LoadingOverlay2 from './components/UI/LoadingOverlay';
import { useEmail } from './store/email-context';

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

function MealsOverviewBottomTabs() {
  return (
    <BottomTabs.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        headerTintColor: GlobalStyles.colors.primary50,
        tabBarStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        tabBarActiveTintColor: GlobalStyles.colors.accent500,
        headerRight: ({ tintColor }) => (
          <>
            <IconButton
              icon="add"
              size={24}
              color={tintColor}
              onPress={() => {
                navigation.navigate('ManageMeal');
              }}
              forLongPress={()=>{Alert.alert("Function of Button","Button adds meal")}}
              iconText="Add meal"
            />
            <IconButton
              icon="bag-add-outline"
              size={24}
              color={tintColor}
              onPress={() => {
                navigation.navigate('ManageGroceryItem');
              }}
              forLongPress={()=>{Alert.alert("Function of Button","Button adds to grocery list")}}
              iconText="Grocery"
            />
            <IconButton
              icon=""
              size={24}
              color={tintColor}
              onPress={() => {
                navigation.navigate('Settings');
              }}
              forLongPress={()=>{Alert.alert("Function of Button","Button opens settings for app.")}}
              awesome="cog"
            />
          </>
          
        ),
      })}
    >
      <BottomTabs.Screen
        name="RecentMeals"
        component={RecentMeals}
        options={{
          title: 'Current Week',
          tabBarLabel: 'Current Week',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food-outline" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="AllMeals"
        component={AllMeals}
        options={{
          title: 'All Meals',
          tabBarLabel: 'All Meals',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="GroceryList"
        component={GroceryList}
        options={{
          title: 'Grocery List',
          tabBarLabel: 'Grocery List',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-sharp" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen 
        name="LogOut" 
        component={LogOut}
        options={{//used for a specific screen
          title:'LogOut',
          tabBarIcon:({color,size})=>(
            <Ionicons name='log-out' color={color} size = {size}/>
          ),
        }}/>
    </BottomTabs.Navigator>
  );
}

export default function App() {

  //This sets up the login/signup screens
  function AuthStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: GlobalStyles.colors.primary500, },
          headerTintColor: GlobalStyles.colors.primary50,
          contentStyle: { backgroundColor: GlobalStyles.colors.primary800 },
        }}
      >
        <Stack.Screen name="Meal Planner Login" component={LoginScreen} />
        <Stack.Screen name="Meal Planner Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  function TabNavigator(){
    console.log("Made it to tabNavigator");
    return(

        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
            headerTintColor: GlobalStyles.colors.primary50,
          }}
        >
          <Stack.Screen
            name="MealsOverview"
            component={MealsOverviewBottomTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManageMeal"
            component={ManageMeal}
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="ManageGroceryItem"
            component={ManageGroceryItem}
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>

    )
    
  }

  //if the login is complete this chooses TabNavigator which takes you to the main app screens.  If not it takes you to the screens for login/signup.
  function Navigation() {
    const authCtx = useContext(AuthContext);
  
    return (
      <NavigationContainer>
        {!authCtx.isAuthenticated && <AuthStack />}
        {authCtx.isAuthenticated && <TabNavigator />}
        {/* {authCtx.isAuthenticated && <WelcomeStack />} */}
      </NavigationContainer>
    );
  }
  
  function Root() {
    const [isTryingLogin, setIsTryingLogin] = useState(true);
  
    const authCtx = useContext(AuthContext);
    const {emailAddress, setEmailAddress} = useEmail()
  
    useEffect(() => {
      async function fetchToken() {
        console.log("Made it to fetchToken")
        const storedToken = await AsyncStorage.getItem(emailAddress + 'token');
  
        if (!storedToken) {
          authCtx.authenticate(storedToken);
        }
  
        setIsTryingLogin(false);
      }
  
      fetchToken();
    }, []);
  
    if (isTryingLogin) {
      //apploading makes sure that it prolongs the loading screen and doesn't flash the log in screen.
      //return <AppLoading />;
      return <LoadingOverlay2/>;
    }
    //SplashScreen.hideAsync();
    return <Navigation />;
  }

  return (
    <>
      <StatusBar style="light"/>
      <EmailProvider>
        <AuthContextProvider>
          <MealsContextProvider>
            <ListsContextProvider>
              <Root/>
            </ListsContextProvider>
          </MealsContextProvider> 
        </AuthContextProvider>
      </EmailProvider>
    </>
  );
}
