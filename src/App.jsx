import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import store from "./store/store";
import AppNavigator from "./navigation/AppNavigator";
import AuthContext from "./context/AuthContext";
import { loadPersistedCart } from "./utils/cartPersistence";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setIsAuthenticated(true);
        store.dispatch(loadPersistedCart());
      }
    } catch (e) {
      console.error("Failed to load token");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Provider store={store}>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthContext.Provider>
    </Provider>
  );
}
