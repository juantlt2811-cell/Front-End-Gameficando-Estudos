import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
      setErro(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha"
      />
      {erro && <p>{erro}</p>}
      <button type="submit">Entrar</button>
      <p>
        Não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </form>
  );
}
