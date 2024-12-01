import React from "react";
import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { Text } from "react-native-elements";
import { API_URL } from "../services/api";

const COLORS = {
  primary: "#FF6600", // Naranja ferretero
  secondary: "#4A4A4A", // Gris oscuro
  background: "#F5F5F5", // Gris claro
  text: "#333333", // Casi negro
  white: "#FFFFFF",
};

export default function ProductCard({ product, onPress }) {
  const trimmedName =
    product.name.length > 20
      ? product.name.substring(0, 20) + "..."
      : product.name;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: `${API_URL}${product.image}` }}
          style={styles.image}
          resizeMode="contain"
          padding="10%"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{trimmedName}</Text>
          <Text style={styles.price}>
            {product.price.toLocaleString("es-HN", {
              style: "currency",
              currency: "HNL",
            })}
          </Text>
          {product.stock > 0 ? (
            <Text style={styles.inStock}>En stock</Text>
          ) : (
            <Text style={styles.outOfStock}>Agotado</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 0,
    overflow: "hidden",
  },
  image: {
    aspectRatio: 1,
    width: "100%",
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  inStock: {
    fontSize: 12,
    color: COLORS.primary,
  },
  outOfStock: {
    fontSize: 12,
    color: COLORS.secondary,
  },
});
