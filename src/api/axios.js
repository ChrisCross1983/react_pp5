import axios from "axios";

axios.defaults.baseURL = "https://luckycat-b653875cceaf.herokuapp.com/api";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
axios.defaults.withCredentials = true;

export const axiosReq = axios.create();
export const axiosRes = axios.create();
