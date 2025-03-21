import React, { createContext, useState, useContext } from 'react';

// Create the context
const EmailContext = createContext();

// Context Provider component
export const EmailProvider = ({ children }) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [accountType, setAccountType] = useState('');
  const [groupUsing, setGroupUsing] = useState('');
  
  return (
    <EmailContext.Provider value={{ 
      emailAddress, setEmailAddress, 
      accountType,  setAccountType, 
      groupUsing,   setGroupUsing 
    }}>
      {children}
    </EmailContext.Provider>
  );
};

// Custom hook to use the email context
export const useEmail = () => useContext(EmailContext);
