import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { mensagemErro } from "../utils/erroRede";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { login } = useAuth();
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    try {
      await login(email, senha);
      navigate("/");
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  return (
    <div className="pagina-auth">
      <div className="cartao-auth">
        <form onSubmit={handleSubmit}>
          <h1>Entrar</h1>
          <div className="campo">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="campo campo-senha">
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="botao-mostrar-senha"
              onClick={() => setMostrarSenha((v) => !v)}
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit">Entrar</button>
          <p>
            Não tem conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
