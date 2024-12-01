import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text, Input, Button } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import AuthContext from "../context/AuthContext";
import { clearCart } from "../store/cartSlice";
import { clearPersistedCart } from "../utils/cartPersistence";
import { getUserDetails, updateUserDetails } from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#FF6600",
  secondary: "#4A4A4A",
  background: "#F5F5F5",
  text: "#333333",
  white: "#FFFFFF",
};

export default function ProfileScreen() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [userDetails, setUserDetails] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserDetails();
      setUserDetails(data);
      setName(data.name);
      setEmail(data.email);
      setStreet(data.address.street);
      setCity(data.address.city);
      setDepartment(data.address.department);
      setDescription(data.address.description);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError(
        "No se pudieron cargar los detalles del usuario. Por favor, inténtelo de nuevo."
      );
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userEmail");
      dispatch(clearCart());
      await clearPersistedCart();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, setIsAuthenticated]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleUpdate = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !street.trim() ||
      !city.trim() ||
      !department.trim() ||
      !description.trim()
    ) {
      Alert.alert(
        "Error",
        "Todos los campos son obligatorios y no pueden estar vacíos."
      );
      return;
    }

    setUpdating(true);
    try {
      const updates = {};
      if (name !== userDetails.name) updates.name = name;
      if (email !== userDetails.email) updates.email = email;
      if (street !== userDetails.address.street)
        updates.address = { ...updates.address, street };
      if (city !== userDetails.address.city)
        updates.address = { ...updates.address, city };
      if (department !== userDetails.address.department)
        updates.address = { ...updates.address, department };
      if (description !== userDetails.address.description)
        updates.address = { ...updates.address, description };

      if (Object.keys(updates).length > 0) {
        await updateUserDetails(updates);
        await fetchUserDetails();
        setIsEditing(false);
        Alert.alert(
          "Éxito",
          "Información de usuario actualizada correctamente."
        );
      } else {
        Alert.alert(
          "Sin cambios",
          "No se realizaron cambios en la información del usuario."
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la información del usuario.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userEmail");
      dispatch(clearCart());
      await clearPersistedCart();
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Error al cerrar sesión o limpiar el carrito");
    }
  };

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
          onPress={fetchUserDetails}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información del usuario</Text>
        <View style={styles.divider} />
        {isEditing ? (
          <>
            <Input
              label="Nombre"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              containerStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              autoCorrect={false}
              containerStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
            <Input
              label="Calle"
              value={street}
              onChangeText={setStreet}
              autoCapitalize="words"
              autoComplete="street-address"
              containerStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
            <Input
              label="Ciudad"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoComplete="address-level2"
              containerStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
            <Input
              label="Departamento"
              value={department}
              onChangeText={setDepartment}
              autoCapitalize="words"
              autoComplete="address-level1"
              containerStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
            <Input
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              autoCapitalize="words"
              autoComplete="off"
              containerStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
            <Button
              title="Guardar cambios"
              onPress={handleUpdate}
              loading={updating}
              buttonStyle={styles.updateButton}
              titleStyle={styles.buttonText}
            />
            <Button
              title="Cancelar"
              onPress={() => {
                setIsEditing(false);
                setName(userDetails.name);
                setEmail(userDetails.email);
                setStreet(userDetails.address.street);
                setCity(userDetails.address.city);
                setDepartment(userDetails.address.department);
                setDescription(userDetails.address.description);
              }}
              buttonStyle={styles.cancelButton}
              titleStyle={styles.buttonText}
            />
          </>
        ) : (
          <>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{userDetails.name}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Correo:</Text>
              <Text style={styles.value}>{userDetails.email}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Calle:</Text>
              <Text style={styles.value}>{userDetails.address.street}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Ciudad:</Text>
              <Text style={styles.value}>{userDetails.address.city}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Departamento:</Text>
              <Text style={styles.value}>{userDetails.address.department}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Descripción:</Text>
              <Text style={styles.value}>
                {userDetails.address.description}
              </Text>
            </View>
            <Button
              title="Editar información"
              onPress={() => setIsEditing(true)}
              buttonStyle={styles.editButton}
              titleStyle={styles.buttonText}
            />
          </>
        )}
      </View>
      <Button
        title="Cerrar sesión"
        onPress={handleLogout}
        buttonStyle={styles.logoutButton}
        titleStyle={styles.buttonText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.secondary,
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  value: {
    flex: 1,
    textAlign: "right",
    color: COLORS.secondary,
  },
  input: {
    marginBottom: 15,
  },
  inputLabel: {
    color: COLORS.text,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingVertical: 12,
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingVertical: 12,
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 0,
    paddingVertical: 12,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
