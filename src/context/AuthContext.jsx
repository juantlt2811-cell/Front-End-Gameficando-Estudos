import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { API_BASE_URL } from "../constants/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  // Guarda o usuário mais recente para as funções abaixo lerem sem precisarem
  // ser recriadas a cada mudança de estado. Assim `fetchAutenticado` mantém a
  // mesma identidade entre renders e pode entrar nas dependências de useEffect
  // sem disparar requisições repetidas (por exemplo, quando o token é renovado).
  const usuarioRef = useRef(usuario);

  const salvarUsuario = useCallback((dados) => {
    usuarioRef.current = dados;
    setUsuario(dados);
    localStorage.setItem("usuario", JSON.stringify(dados));
  }, []);

  const login = useCallback(
    async (email, senha) => {
      const resposta = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível entrar.");
      salvarUsuario(dados);
    },
    [salvarUsuario],
  );

  const logout = useCallback(async () => {
    const refreshToken = usuarioRef.current?.refreshToken;
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // mesmo se der erro de rede, desloga localmente
      }
    }
    usuarioRef.current = null;
    setUsuario(null);
    localStorage.removeItem("usuario");
  }, []);

  const atualizarToken = useCallback(async () => {
    const refreshToken = usuarioRef.current?.refreshToken;
    if (!refreshToken) throw new Error("Sem refresh token.");

    const resposta = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      logout();
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    salvarUsuario(dados);
    return dados;
  }, [logout, salvarUsuario]);

  // Use essa função no lugar de fetch() puro em toda chamada que precisa do Bearer token.
  const fetchAutenticado = useCallback(
    async (url, options = {}) => {
      const comToken = (token) => ({
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      });

      let resposta = await fetch(url, comToken(usuarioRef.current?.token));

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
    },
    [atualizarToken],
  );

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
