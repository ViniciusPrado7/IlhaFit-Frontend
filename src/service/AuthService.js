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
  }
};