import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    "https://8000-chriscross1983-drfpp5-1kzqisvpqcg.ws.codeinstitute-ide.net/api/profiles/",
  withCredentials: true,
});

export default axiosInstance;
