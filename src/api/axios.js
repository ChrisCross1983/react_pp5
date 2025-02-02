import axios from "axios";

export const API_BASE_URL = "https://luckycat-b653875cceaf.herokuapp.com/api";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

export const getCsrfToken = async () => {
  try {
    const response = await axios.get("/auth/csrf/");
    return response.data.csrfToken;
  } catch (error) {
    console.error("❌ CSRF-Token cannot been called:", error);
    return null;
  }
};

export const axiosReq = axios.create({ baseURL: API_BASE_URL });
export const axiosRes = axios.create({ baseURL: API_BASE_URL });
