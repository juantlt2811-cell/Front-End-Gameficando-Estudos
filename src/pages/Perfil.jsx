import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Perfil() {
  const { fetchAutenticado, logout } = useAuth();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [mostrarExclusao, setMostrarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await fetchAutenticado(
          "https://localhost:7259/api/usuario/meus-dados",
        );
        const dados = await resposta.json();
        if (!resposta.ok)
          throw new Error(
            dados.erro || "Não foi possível carregar seus dados.",
          );
        setDados(dados);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  function baixarJson() {
    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meus-dados-gameficando.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleExcluirConta(e) {
    e.preventDefault();
    setErroExclusao(null);
    setExcluindo(true);
    try {
      const resposta = await fetchAutenticado(
        "https://localhost:7259/api/usuario/minha-conta",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senhaAtual: senhaConfirmacao }),
        },
      );
      const resultado = await resposta.json();
      if (!resposta.ok)
        throw new Error(resultado.erro || "Não foi possível excluir a conta.");

      logout();
      navigate("/login");
    } catch (err) {
      setErroExclusao(err.message);
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div className="App">
      <Link to="/">← Voltar</Link>
      <h1>Meus dados</h1>

      <p>Nome: {dados.nome}</p>
      <p>Email: {dados.email}</p>
      <p>Tipo: {dados.tipo}</p>
      <p>Cadastrado em: {new Date(dados.criadoEm).toLocaleDateString()}</p>

      {dados.gamificacao && (
        <>
          <p>Ofensiva atual: {dados.gamificacao.ofensivaAtual}</p>
          <p>Maior ofensiva: {dados.gamificacao.maiorOfensiva}</p>
        </>
      )}

      <button onClick={baixarJson}>Baixar meus dados (JSON)</button>

      <hr />

      {!mostrarExclusao ? (
        <button onClick={() => setMostrarExclusao(true)}>
          Excluir minha conta
        </button>
      ) : (
        <form onSubmit={handleExcluirConta}>
          <p>Essa ação é irreversível. Digite sua senha pra confirmar.</p>
          <input
            type="password"
            value={senhaConfirmacao}
            onChange={(e) => setSenhaConfirmacao(e.target.value)}
            placeholder="Senha atual"
          />
          {erroExclusao && <p>{erroExclusao}</p>}
          <button type="submit" disabled={excluindo}>
            {excluindo ? "Excluindo..." : "Confirmar exclusão"}
          </button>
          <button type="button" onClick={() => setMostrarExclusao(false)}>
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
