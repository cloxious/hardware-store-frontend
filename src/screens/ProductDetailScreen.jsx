import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text, Button, Image, Icon } from "react-native-elements";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { getProductById, API_URL } from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#FF6600", // Naranja ferretero
  secondary: "#4A4A4A", // Gris oscuro
  background: "#F5F5F5", // Gris claro
  text: "#333333", // Casi negro
  white: "#FFFFFF",
};

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const fetchProduct = useCallback(async () => {
    try {
      const data = await getProductById(productId);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(
        "No se pudo cargar los detalles del producto. Por favor, inténtelo de nuevo más tarde."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProduct();
  }, [fetchProduct]);

  const updateQuantity = (change) => {
    setQuantity((prevQuantity) =>
      Math.max(1, Math.min(prevQuantity + change, product.stock))
    );
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    Alert.alert(
      "Añadido al Carrito",
      `${quantity} ${quantity > 1 ? "unidades" : "unidad"} de ${
        product.name
      } añadido al carrito!`,
      [{ text: "OK", onPress: () => console.log("OK Presionado") }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, styles.container]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.centered, styles.container]}>
        <Text style={styles.errorText}>
          {error || "Producto no encontrado"}
        </Text>
        <Button
          title="Reintentar"
          onPress={onRefresh}
          containerStyle={styles.retryButton}
          buttonStyle={{ backgroundColor: COLORS.primary }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Image
        source={{ uri: `${API_URL}${product.image}` }}
        style={styles.image}
        resizeMode="contain"
        padding="10%"
        PlaceholderContent={<ActivityIndicator color={COLORS.primary} />}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {product.price.toLocaleString("es-HN", {
            style: "currency",
            currency: "HNL",
          })}
        </Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cantidad:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => updateQuantity(-1)}
              disabled={quantity <= 1}
              style={[
                styles.quantityButton,
                quantity <= 1 && styles.disabledButton,
              ]}
            >
              <Icon
                name="remove"
                size={20}
                color={quantity <= 1 ? COLORS.secondary : COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(1)}
              disabled={quantity >= product.stock}
              style={[
                styles.quantityButton,
                quantity >= product.stock && styles.disabledButton,
              ]}
            >
              <Icon
                name="add"
                size={20}
                color={
                  quantity >= product.stock ? COLORS.secondary : COLORS.primary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <Button
          title={product.stock > 0 ? "Añadir al carrito" : "Agotado"}
          onPress={handleAddToCart}
          containerStyle={styles.button}
          buttonStyle={{ backgroundColor: COLORS.primary }}
          disabled={product.stock === 0}
          disabledStyle={{ backgroundColor: COLORS.secondary }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
  },
  details: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    color: COLORS.primary,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 10,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 15,
    color: COLORS.text,
  },
  stock: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
  retryButton: {
    marginTop: 20,
    width: 200,
  },
  errorText: {
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
});
