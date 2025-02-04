import axios from "axios";

export const axiosReq = axios.create({
  baseURL: "https://luckycat-b653875cceaf.herokuapp.com/api/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCsrfToken = async () => {
  try {
    const response = await axiosReq.get("/auth/csrf/");
    return response.data.csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    return null;
  }
};