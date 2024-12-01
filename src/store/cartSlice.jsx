import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const { _id, quantity } = action.payload;
      const existingItem = state.find((item) => item._id === _id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.push(action.payload);
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.find((item) => item._id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    removeFromCart: (state, action) => {
      return state.filter((item) => item._id !== action.payload);
    },
    clearCart: (state) => {
      return [];
    },
    loadCart: (state, action) => {
      return action.payload;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  loadCart,
} = cartSlice.actions;
export default cartSlice.reducer;
