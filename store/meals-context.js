import { createContext, useReducer } from 'react';

export const MealsContext = createContext({
  meals: [],
  dates: [], // Added dates array
  addMeal: ({ description, date, groceryItems, group }) => {},
  setMeals: (meals) => {},
  deleteMeal: (id) => {},
  updateMeal: (id, { description, date, groceryItems, group }) => {},
  setDates: (dates) => {}, // Function to set multiple dates
  addDate: (date) => {}, // Function to add a single date
});

function mealsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, meals: [action.payload, ...state.meals] };
    case 'SET':
      return { ...state, meals: [...action.payload,].sort((a, b) => a.date - b.date) };
      //return { ...state, meals: action.payload.reverse() };
      //const mealsSorted = [...action.payload,].sort((a, b) => a.date - b.date)
    case 'UPDATE':
      const updatableMealIndex = state.meals.findIndex(
        (meal) => meal.id === action.payload.id
      );
      const updatableMeal = state.meals[updatableMealIndex];
      const updatedItem = { ...updatableMeal, ...action.payload.data };
      const updatedMeals = [...state.meals];
      updatedMeals[updatableMealIndex] = updatedItem;
      return { ...state, meals: updatedMeals };
    case 'DELETE':
      return { ...state, meals: state.meals.filter((meal) => meal.id !== action.payload) };
    case 'SET_DATES': 
      return { ...state, dates: action.payload }; // Setting multiple dates
    case 'ADD_DATE': 
      return { ...state, dates: [...state.dates, action.payload] }; // Adding a single date
    default:
      return state;
  }
}

function MealsContextProvider({ children }) {
  const [state, dispatch] = useReducer(mealsReducer, { meals: [], dates: [] });

  function addMeal(mealData) {
    dispatch({ type: 'ADD', payload: mealData });
  }

  function setMeals(meals) {
    dispatch({ type: 'SET', payload: meals });
  }

  function deleteMeal(id) {
    dispatch({ type: 'DELETE', payload: id });
  }

  function updateMeal(id, mealData) {
    dispatch({ type: 'UPDATE', payload: { id: id, data: mealData } });
  }

  function setDates(dates) {
    dispatch({ type: 'SET_DATES', payload: dates });
  }

  function addDate(date) {
    dispatch({ type: 'ADD_DATE', payload: date });
  }

  const value = {
    meals: state.meals,
    dates: state.dates,
    setMeals,
    addMeal,
    deleteMeal,
    updateMeal,
    setDates,
    addDate,
  };

  return (
    <MealsContext.Provider value={value}>
      {children}
    </MealsContext.Provider>
  );
}

export default MealsContextProvider;
