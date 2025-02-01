import axios from "axios";

axios.defaults.baseURL = "https://luckycat-b653875cceaf.herokuapp.com/api";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

export const axiosReq = axios.create();
export const axiosRes = axios.create();

//export const getCsrfToken = async () => {
//  try {
//    const response = await axios.get("/auth/csrf/");
//    return response.data.csrfToken;
//  } catch (error) {
//    console.error("CSRF-Token cannot been called", error);
//    return null;
//  }
//};
