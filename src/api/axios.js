import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/";

export const axiosReq = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosReq.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosReq.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("🔄 Access token expired, attempting refresh...");

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("❌ No refresh token found! Redirecting to login...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${baseURL}auth/token/refresh/`,
          { refresh: refreshToken }
        );

        console.log("✅ Tokens successfully refreshed:", res.data);
        localStorage.setItem("accessToken", res.data.access);
        localStorage.setItem("refreshToken", res.data.refresh);

        axiosReq.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
        error.config.headers.Authorization = `Bearer ${res.data.access}`;

        return axiosReq(error.config);
      } catch (err) {
        console.error("❌ Token refresh failed:", err.response?.data || err.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
