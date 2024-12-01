import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text, Button } from "react-native-elements";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#FF6600", // Naranja ferretero
  secondary: "#4A4A4A", // Gris oscuro
  background: "#F5F5F5", // Gris claro
  text: "#333333", // Casi negro
  white: "#FFFFFF",
};

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(
        "No se pudieron cargar los productos. Por favor, inténtelo de nuevo más tarde."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() =>
        navigation.navigate("ProductDetail", { productId: item._id })
      }
    />
  );

  if (loading) {
    return (
      <View style={[styles.centered, styles.container]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, styles.container]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Reintentar"
          onPress={fetchProducts}
          containerStyle={styles.retryButton}
          buttonStyle={{ backgroundColor: COLORS.primary }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No hay productos disponibles.
            </Text>
          </View>
        }
      />
    </View>
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
  productList: {
    padding: 8,
  },
  errorText: {
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    width: 200,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    color: COLORS.secondary,
    fontSize: 16,
    textAlign: "center",
  },
});
