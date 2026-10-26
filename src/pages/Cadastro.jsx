import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TIPO_USUARIO } from "../constants/tipoUsuario";
import { API_BASE_URL } from "../constants/api";
import { mensagemErro } from "../utils/erroRede";

export function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState(TIPO_USUARIO.ALUNO);
  const [codigoProfessor, setCodigoProfessor] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`${API_BASE_URL}/api/auth/cadastrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha,
          codigoProfessor:
            tipoUsuario === TIPO_USUARIO.PROFESSOR ? codigoProfessor : null,
        }),
      });
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
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-auth">
      <div className="cartao-auth">
        <form onSubmit={handleSubmit}>
          <h1>Criar conta</h1>

          <div className="campo">
            <label htmlFor="cadastro-nome">Nome</label>
            <input
              id="cadastro-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="cadastro-email">Email</label>
            <input
              id="cadastro-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              maxLength={150}
              autoComplete="email"
              required
            />
          </div>

          <div className="campo campo-senha">
            <label htmlFor="cadastro-senha">Senha</label>
            <input
              id="cadastro-senha"
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mín. 8, com maiúscula, minúscula e número"
              maxLength={128}
              autoComplete="new-password"
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

          {tipoUsuario === TIPO_USUARIO.PROFESSOR && (
            <div className="campo">
              <label htmlFor="cadastro-codigo-professor">
                Código de professor
              </label>
              <input
                id="cadastro-codigo-professor"
                type="password"
                value={codigoProfessor}
                onChange={(e) => setCodigoProfessor(e.target.value)}
                placeholder="Fornecido pela instituição"
                autoComplete="off"
                maxLength={200}
                required
              />
            </div>
          )}

          {erro && <p className="erro">{erro}</p>}
          <button type="submit" disabled={enviando}>
            {enviando ? "Criando..." : "Criar conta"}
          </button>
          <p>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
