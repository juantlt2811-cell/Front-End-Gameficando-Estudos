import "./App.css";
import { useState, useEffect } from "react";
import { ContadorAtividades } from "./ContadorAtividades";
import { ListaMaterias } from "./ListaMaterias";

function App() {
  const [materias, setMaterias] = useState([]);
  const [atividadesFeitas, setAtividadesFeitas] = useState(0);
  const [carregando, setCarregando] = useState(true); // começa true: ainda não chegou nada
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await fetch(
          "https://jsonplaceholder.typicode.com/users",
        );
        const dados = await resposta.json();
        setMaterias(dados);
      } catch (e) {
        setErro("Não foi possível carregar as matérias.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const [nome, setNome] = useState("");
  useEffect(() => {
    document.title = `Atividades feitas: ${atividadesFeitas}`;
  }, [atividadesFeitas]);
  return (
    <div className="App">
      <h1>Primeiro contato com React - Projeto Gameficando Estudos</h1>
      <button
        onClick={() => setAtividadesFeitas(atividadesFeitas + 1)}
        disabled={atividadesFeitas >= 3}
      >
        Concluir atividade
      </button>

      <input value={nome} onChange={(e) => setNome(e.target.value)} />
      <p>Nome digitado: {nome}</p>
      <ContadorAtividades total={atividadesFeitas} />
      {carregando && <p>Carregando matérias...</p>}
      {erro && <p>{erro}</p>}
      {!carregando && !erro && <ListaMaterias materias={materias} />}
      {atividadesFeitas >= 3 && <p> Limite Diário Atingido </p>}
    </div>
  );
}

export default App;
