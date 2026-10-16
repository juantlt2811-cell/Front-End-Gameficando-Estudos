import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ListaMaterias } from "../components/ListaMaterias";
import { CriarMateriaForm } from "../components/CriarMateriaForm";

export function MinhasMaterias() {
  const { usuario } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregarMinhas() {
    setCarregando(true);
    try {
      const resposta = await fetch(
        "https://localhost:7259/api/materia/minhas",
        {
          headers: { Authorization: `Bearer ${usuario?.token}` },
        },
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

  return (
    <div className="App">
      <Link to="/">← Voltar</Link>
      <h1>Minhas matérias</h1>

      <CriarMateriaForm onCriada={carregarMinhas} />

      {carregando && <p>Carregando...</p>}
      {erro && <p>{erro}</p>}
      {!carregando && !erro && <ListaMaterias materias={materias} />}
    </div>
  );
}
