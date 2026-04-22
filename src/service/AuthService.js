import { api } from "./Api";

export const authService = {
  async login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    const data = response.data;

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  async register(data, tipo) {
    const response = await api.post("/auth/register", { ...data, tipo });
    return response.data;
  },

  async esqueciSenha(email) {
    const response = await api.post("/auth/esqueci-senha", { email });
    return response.data;
  },
};

