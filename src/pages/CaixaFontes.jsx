import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function CaixaFontes() {
  const { id } = useParams();
  const idMateria = Number(id);
  const { usuario } = useAuth();

  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [tituloTexto, setTituloTexto] = useState("");
  const [textoCompleto, setTextoCompleto] = useState("");
  const [enviandoTexto, setEnviandoTexto] = useState(false);

  const [arquivo, setArquivo] = useState(null);
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);

  async function carregarMateriais() {
    setCarregando(true);
    try {
      const resposta = await fetch(
        `https://localhost:7259/api/caixafontes/materia/${idMateria}/materiais`,
        { headers: { Authorization: `Bearer ${usuario.token}` } },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível carregar.");
      setMateriais(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMateriais();
  }, [idMateria]);

  async function handleEnviarTexto(e) {
    e.preventDefault();
    setEnviandoTexto(true);
    setErro(null);
    try {
      const resposta = await fetch(
        "https://localhost:7259/api/caixafontes/processar-texto",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usuario.token}`,
          },
          body: JSON.stringify({
            idMateria,
            tituloMaterial: tituloTexto,
            textoCompleto,
          }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível processar o texto.");

      setTituloTexto("");
      setTextoCompleto("");
      carregarMateriais();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviandoTexto(false);
    }
  }

  async function handleEnviarArquivo(e) {
    e.preventDefault();
    if (!arquivo) return;
    setEnviandoArquivo(true);
    setErro(null);
    try {
      const formData = new FormData();
      formData.append("idMateria", idMateria);
      formData.append("arquivo", arquivo);

      const resposta = await fetch(
        "https://localhost:7259/api/caixafontes/upload",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${usuario.token}` },
          body: formData,
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível processar o arquivo.");

      setArquivo(null);
      e.target.reset();
      carregarMateriais();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviandoArquivo(false);
    }
  }

  async function handleRemover(documentoId) {
    if (!window.confirm("Remover esse material da base de conhecimento?"))
      return;
    try {
      const resposta = await fetch(
        "https://localhost:7259/api/caixafontes/remover-material",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usuario.token}`,
          },
          body: JSON.stringify({ idMateria, documentoId }),
        },
      );
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro || "Não foi possível remover.");
      }
      carregarMateriais();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="App">
      <Link to="/minhas-materias">← Minhas matérias</Link>
      <h1>Base de conhecimento</h1>

      <h3>Adicionar texto</h3>
      <form onSubmit={handleEnviarTexto}>
        <input
          value={tituloTexto}
          onChange={(e) => setTituloTexto(e.target.value)}
          placeholder="Título do material"
        />
        <textarea
          value={textoCompleto}
          onChange={(e) => setTextoCompleto(e.target.value)}
          placeholder="Cole o texto completo aqui"
          rows={6}
        />
        <button type="submit" disabled={enviandoTexto}>
          {enviandoTexto ? "Processando..." : "Adicionar texto"}
        </button>
      </form>

      <h3>Enviar arquivo</h3>
      <form onSubmit={handleEnviarArquivo}>
        <input type="file" onChange={(e) => setArquivo(e.target.files[0])} />
        <button type="submit" disabled={enviandoArquivo || !arquivo}>
          {enviandoArquivo ? "Processando..." : "Enviar arquivo"}
        </button>
      </form>

      {erro && <p>{erro}</p>}

      <h3>Materiais já processados</h3>
      {carregando && <p>Carregando...</p>}
      {!carregando && materiais.length === 0 && <p>Nenhum material ainda.</p>}
      <ul>
        {materiais.map((m) => (
          <li key={m.documentoId}>
            {m.tituloMaterial} ({m.quantidadeChunks} trechos)
            <button onClick={() => handleRemover(m.documentoId)}>
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
