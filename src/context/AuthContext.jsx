import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  function salvarUsuario(dados) {
    setUsuario(dados);
    localStorage.setItem("usuario", JSON.stringify(dados));
  }

  async function login(email, senha) {
    const resposta = await fetch("https://localhost:7259/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || "Não foi possível entrar.");
    salvarUsuario(dados);
  }

  async function atualizarToken() {
    if (!usuario?.refreshToken) throw new Error("Sem refresh token.");

    const resposta = await fetch("https://localhost:7259/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: usuario.refreshToken }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      logout();
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    salvarUsuario(dados);
    return dados;
  }

  async function logout() {
    if (usuario?.refreshToken) {
      try {
        await fetch("https://localhost:7259/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: usuario.refreshToken }),
        });
      } catch {
        // mesmo se der erro de rede, desloga localmente
      }
    }
    setUsuario(null);
    localStorage.removeItem("usuario");
  }

  // Use essa função no lugar de fetch() puro em toda chamada que precisa do Bearer token.
  async function fetchAutenticado(url, options = {}) {
    const comToken = (token) => ({
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });

    let resposta = await fetch(url, comToken(usuario.token));

    if (resposta.status === 401) {
      try {
        const novosDados = await atualizarToken();
        resposta = await fetch(url, comToken(novosDados.token));
      } catch {
        return new Response(
          JSON.stringify({ erro: "Sessão expirada. Faça login novamente." }),
          { status: 401 },
        );
      }
    }

    return resposta;
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, fetchAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto)
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return contexto;
}
