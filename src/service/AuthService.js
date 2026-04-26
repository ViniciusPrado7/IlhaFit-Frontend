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

  async register(data) {
    const { confirmarSenha, ...rest } = data;
    const response = await api.post("/usuarios/cadastrar", {
      ...rest,
      confirmacaoSenha: data.confirmacaoSenha || confirmarSenha,
    });
    return response.data;
  },

  async esqueciSenha(email) {
    const response = await api.post("/auth/esqueci-senha", { email });
    return response.data;
  },
};

