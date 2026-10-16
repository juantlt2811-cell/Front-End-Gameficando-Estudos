import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";

export function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState(TIPO_USUARIO.ALUNO);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(
        "https://localhost:7259/api/auth/cadastrar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, senha, tipoUsuario }),
        },
      );
      const dados = await resposta.json();

      if (!resposta.ok) {
        if (dados.errors) {
          const primeiraMensagem = Object.values(dados.errors)[0][0];
          throw new Error(primeiraMensagem);
        }
        throw new Error(dados.erro || "Não foi possível cadastrar.");
      }

      await login(email, senha);
      navigate("/");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Criar conta</h1>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha (mín. 8, com maiúscula, minúscula e número)"
      />

      <label>
        <input
          type="radio"
          checked={tipoUsuario === TIPO_USUARIO.ALUNO}
          onChange={() => setTipoUsuario(TIPO_USUARIO.ALUNO)}
        />
        Aluno
      </label>
      <label>
        <input
          type="radio"
          checked={tipoUsuario === TIPO_USUARIO.PROFESSOR}
          onChange={() => setTipoUsuario(TIPO_USUARIO.PROFESSOR)}
        />
        Professor
      </label>

      {erro && <p>{erro}</p>}
      <button type="submit" disabled={enviando}>
        {enviando ? "Criando..." : "Criar conta"}
      </button>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </form>
  );
}
