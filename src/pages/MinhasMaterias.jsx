import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ListaMaterias } from "../components/ListaMaterias";
import { CriarMateriaForm } from "../components/CriarMateriaForm";

export function MinhasMaterias() {
  const { fetchAutenticado } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [materiaEditando, setMateriaEditando] = useState(null);

  async function carregarMinhas() {
    setCarregando(true);
    try {
      const resposta = await fetchAutenticado(
        "https://localhost:7259/api/materia/minhas",
      );
      const dados = await resposta.json();
      setMaterias(dados);
    } catch (e) {
      setErro("Não foi possível carregar suas matérias.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMinhas();
  }, []);

  async function handleExcluir(id) {
    if (!window.confirm("Tem certeza que quer excluir essa matéria?")) return;
    try {
      const resposta = await fetchAutenticado(
        `https://localhost:7259/api/materia/${id}`,
        { method: "DELETE" },
      );
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro || "Não foi possível excluir.");
      }
      carregarMinhas();
    } catch (err) {
      setErro(err.message);
    }
  }

  function handleSalvo() {
    setMateriaEditando(null);
    carregarMinhas();
  }

  return (
    <div className="App">
      <Link to="/materias">← Voltar</Link>
      <h1>Minhas matérias</h1>

      <CriarMateriaForm
        onCriada={handleSalvo}
        materiaParaEditar={materiaEditando}
        onCancelarEdicao={() => setMateriaEditando(null)}
      />

      {carregando && <p>Carregando...</p>}
      {erro && <p>{erro}</p>}
      {!carregando && !erro && (
        <ListaMaterias
          materias={materias}
          onEditar={setMateriaEditando}
          onExcluir={handleExcluir}
          onGerenciarFontes={true}
        />
      )}
    </div>
  );
}
