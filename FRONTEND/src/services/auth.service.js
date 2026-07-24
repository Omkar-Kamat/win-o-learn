import axiosClient from "../api/axiosClient";

export const loginService = (data) =>
  axiosClient.post("/auth/login", data);

export const signupService = (data) =>
  axiosClient.post("/auth/signup", data);

export const logoutService = () =>
  axiosClient.post("/auth/logout");

export const getCurrentUserService = () =>
  axiosClient.get("/auth/me");

export const refreshTokenService = () =>
  axiosClient.post("/auth/refresh-token");