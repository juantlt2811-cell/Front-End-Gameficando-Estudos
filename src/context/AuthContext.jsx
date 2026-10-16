import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  async function login(email, senha) {
    const resposta = await fetch("https://localhost:7259/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!resposta.ok) {
      throw new Error("Email ou senha inválidos.");
    }

    const dados = await resposta.json();
    setUsuario(dados);
    localStorage.setItem("usuario", JSON.stringify(dados));
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem("usuario");
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (contexto === null) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  }
  return contexto;
}
