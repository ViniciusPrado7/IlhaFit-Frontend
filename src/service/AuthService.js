// src/services/authService.js

const API_URL = "http://localhost:8080"; // ajusta pra sua API

export const authService = {
  async login(email, senha) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer login");
    }

    const data = await response.json();

    // salva token (se tiver)
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  async register(data, tipo) {
    // Endpoint provisório para cadastro. Ajuste conforme sua API Spring Boot real.
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Passa o tipo de usuário se a API precisar, ou só os dados
      body: JSON.stringify({ ...data, tipo })
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer cadastro");
    }

    return await response.json();
  }
};