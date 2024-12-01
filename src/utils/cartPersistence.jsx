import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadCart } from "../store/cartSlice";

const CART_STORAGE_KEY = "userCart";

export const saveCart = async (cart) => {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

export const loadPersistedCart = () => async (dispatch) => {
  try {
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
      dispatch(loadCart(JSON.parse(cartData)));
    }
  } catch (error) {
    console.error("Error loading cart:", error);
  }
};

export const clearPersistedCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing persisted cart:", error);
  }
};
