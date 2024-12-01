import axios from "axios";
import { API_URL } from "./api";

const authApi = axios.create({
  baseURL: API_URL,
});

export const register = async (userData) => {
  try {
    const response = await authApi.post("/register", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await authApi.post("/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await authApi.post("/request", { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const resetPassword = async (resetData) => {
  try {
    const response = await authApi.post("/reset", resetData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
