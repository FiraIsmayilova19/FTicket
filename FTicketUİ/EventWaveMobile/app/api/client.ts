import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.5:8000", // backend-in local IP ünvanı (məs: 127.0.0.1 işləmir, əvəzində cihaz IP-ni yaz)
  headers: {
    "Content-Type": "application/json",
  },
});
