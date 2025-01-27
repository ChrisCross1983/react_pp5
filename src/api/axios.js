import axios from "axios";

axios.defaults.withCredentials = true;

const axiosInstance = axios.create({
  baseURL: "https://8000-chriscross1983-drfpp5-1kzqisvpqcg.ws.codeinstitute-ide.net/api/profiles/",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
