import React, { useState, useContext, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, Input, Text } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} from "../services/authService";
import AuthContext from "../context/AuthContext";
import { loadPersistedCart } from "../utils/cartPersistence";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#FF6600",
  secondary: "#4A4A4A",
  background: "#F5F5F5",
  text: "#333333",
  white: "#FFFFFF",
  error: "#FF3B30",
};

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setIsAuthenticated } = useContext(AuthContext);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const handleAuth = useCallback(async () => {
    setLoading(true);
    try {
      if (authMode === "signIn") {
        const { token } = await login({ email, password });
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userEmail", email);
        dispatch(loadPersistedCart());
        setIsAuthenticated(true);
      } else if (authMode === "signUp") {
        await register({
          name,
          email,
          password,
          address: { street, city, department, description },
        });
        Alert.alert(
          "Éxito",
          "Usuario registrado exitosamente. Por favor, inicie sesión."
        );
        setAuthMode("signIn");
      } else if (authMode === "requestReset") {
        await requestPasswordReset(email);
        Alert.alert(
          "Éxito",
          "Código de restablecimiento de contraseña enviado a su correo electrónico."
        );
        setAuthMode("resetPassword");
      } else if (authMode === "resetPassword") {
        await resetPassword({ email, resetCode, newPassword });
        Alert.alert(
          "Éxito",
          "Contraseña restablecida exitosamente. Por favor, inicie sesión con su nueva contraseña."
        );
        setAuthMode("signIn");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Ocurrió un error. Por favor, inténtelo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, [
    authMode,
    name,
    email,
    password,
    street,
    city,
    department,
    description,
    resetCode,
    newPassword,
    setIsAuthenticated,
    dispatch,
  ]);

  const renderTitle = () => {
    switch (authMode) {
      case "signIn":
        return "Iniciar sesión";
      case "signUp":
        return "Registrarse";
      case "requestReset":
        return "Restablecer contraseña";
      case "resetPassword":
        return "Nueva contraseña";
      default:
        return "";
    }
  };

  const renderButton = () => {
    switch (authMode) {
      case "signIn":
        return "Iniciar sesión";
      case "signUp":
        return "Registrarse";
      case "requestReset":
        return "Enviar código";
      case "resetPassword":
        return "Restablecer contraseña";
      default:
        return "";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text h3 style={styles.title}>
          {renderTitle()}
        </Text>
        {authMode === "signUp" && (
          <>
            <Input
              placeholder="Nombre completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Calle"
              value={street}
              onChangeText={setStreet}
              autoCapitalize="words"
              autoComplete="street-address"
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Ciudad"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoComplete="address-level2"
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Departamento"
              value={department}
              onChangeText={setDepartment}
              autoCapitalize="words"
              autoComplete="address-level1"
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Referencias de dirección"
              value={description}
              onChangeText={setDescription}
              autoCapitalize="words"
              autoComplete="off"
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
          </>
        )}
        <Input
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          autoComplete="email"
          editable={authMode !== "resetPassword"}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
        {(authMode === "signIn" || authMode === "signUp") && (
          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            autoComplete="password"
          />
        )}
        {authMode === "resetPassword" && (
          <>
            <Input
              placeholder="Código de restablecimiento"
              value={resetCode}
              onChangeText={setResetCode}
              keyboardType="numeric"
              maxLength={6}
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
              autoComplete="new-password"
            />
          </>
        )}
        <Button
          title={renderButton()}
          onPress={handleAuth}
          loading={loading}
          buttonStyle={styles.mainButton}
          titleStyle={styles.mainButtonText}
        />
        {authMode === "signIn" && (
          <View style={styles.secondaryButtonsContainer}>
            <Button
              title="Registrarse"
              type="clear"
              onPress={() => setAuthMode("signUp")}
              titleStyle={styles.secondaryButtonText}
            />
            <Button
              title="¿Olvidó su contraseña?"
              type="clear"
              onPress={() => setAuthMode("requestReset")}
              titleStyle={styles.secondaryButtonText}
            />
          </View>
        )}
        {authMode !== "signIn" && (
          <Button
            title="Volver a Iniciar sesión"
            type="clear"
            onPress={() => setAuthMode("signIn")}
            titleStyle={styles.secondaryButtonText}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    marginBottom: 30,
    textAlign: "center",
    color: COLORS.text,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: COLORS.white,
    borderRadius: 0,
    marginBottom: 15,
  },
  input: {
    color: COLORS.text,
    paddingHorizontal: 10,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingVertical: 15,
    marginTop: 20,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
  },
});
