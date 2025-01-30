import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    "https://8000-chriscross1983-drfpp5-1kzqisvpqcg.ws.codeinstitute-ide.net/api/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
},
});

export const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get("/auth/csrf/");
    console.log("Fetched CSRF Token:", response.data.csrfToken);
    axiosInstance.defaults.headers.common["X-CSRFToken"] = response.data.csrfToken;
  } catch (error) {
    console.error("CSRF Token fetch error:", error);
  }
};

export default axiosInstance;
