/**
 * UserContext
 * -----------
 * This context provides a global state to manage the user's email across the application.
 * It enables easy access and updates to the user's email without prop drilling.
 * 
 * Features:
 * - Uses React Context API to create a shared state.
 * - Stores the user's email (`userEmail`) using `useState`.
 * - Provides a setter function (`setUserEmail`) to update the email.
 * - Makes the user email state accessible throughout the app via the `useUser` hook.
 * 
 * Components:
 * - `UserProvider`: Wraps the application to provide user email state.
 * - `useUser`: Custom hook to access and update user email from any component.
 * 
 * Usage:
 * - Wrap the root component with `<UserProvider>` to enable context.
 * - Call `useUser()` in any component to get `{ userEmail, setUserEmail }`.
 */

import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);

  return (
    <UserContext.Provider value={{ userEmail, setUserEmail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
