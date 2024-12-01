import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, Button, Icon, Image } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";
import { updateQuantity, removeFromCart, clearCart } from "../store/cartSlice";
import { API_URL, checkout } from "../services/api";
import { saveCart, clearPersistedCart } from "../utils/cartPersistence";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#FF6600",
  secondary: "#4A4A4A",
  background: "#F5F5F5",
  text: "#333333",
  white: "#FFFFFF",
  error: "#FF3B30",
};

export default function CartScreen() {
  const cartItems = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const handleUpdateQuantity = (id, change) => {
    const item = cartItems.find((item) => item._id === id);
    if (item) {
      dispatch(
        updateQuantity({ id, quantity: Math.max(1, item.quantity + change) })
      );
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = useCallback(async () => {
    setIsCheckingOut(true);
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        throw new Error("Correo electrónico del usuario no encontrado");
      }

      await checkout(userEmail, cartItems);

      Alert.alert(
        "Compra Exitosa",
        "Su pedido ha sido realizado y se ha enviado un correo de confirmación.",
        [
          {
            text: "OK",
            onPress: async () => {
              console.log("Vaciando el carrito...");
              dispatch(clearCart());
              await clearPersistedCart();
              console.log("Carrito vaciado.");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error en la Compra",
        error.message || "Ocurrió un error durante la compra"
      );
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, dispatch]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: `${API_URL}${item.image}` }}
        style={styles.productImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString("es-HN", {
            style: "currency",
            currency: "HNL",
          })}
        </Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => handleUpdateQuantity(item._id, -1)}
          disabled={item.quantity === 1}
          style={[
            styles.quantityButton,
            item.quantity === 1 && styles.disabledButton,
          ]}
        >
          <Icon
            name="remove"
            size={20}
            color={item.quantity === 1 ? COLORS.secondary : COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => handleUpdateQuantity(item._id, 1)}
          style={styles.quantityButton}
        >
          <Icon name="add" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveItem(item._id)}
        style={styles.removeButton}
      >
        <Icon name="delete" size={24} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Su carrito está vacío</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.listContainer}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total:{" "}
              {total.toLocaleString("es-HN", {
                style: "currency",
                currency: "HNL",
              })}
            </Text>
            <Button
              title="Realizar compra"
              onPress={handleCheckout}
              loading={isCheckingOut}
              disabled={isCheckingOut || cartItems.length === 0}
              buttonStyle={styles.checkoutButton}
              titleStyle={styles.checkoutButtonText}
              disabledStyle={styles.disabledCheckoutButton}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginBottom: 10,
    padding: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  quantityButton: {
    padding: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: COLORS.text,
  },
  removeButton: {
    padding: 5,
  },
  totalContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
    backgroundColor: COLORS.white,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledCheckoutButton: {
    backgroundColor: COLORS.secondary,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    color: COLORS.secondary,
  },
});
