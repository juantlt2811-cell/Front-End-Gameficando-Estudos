import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { usuario } = useAuth();

  return (
    <div className="App">
      <h1>Olá, {usuario.nome}</h1>

      <div className="cards-dashboard">
        <Link to="/materias" className="card-dashboard">
          <h3>Matérias</h3>
          <p>Veja as matérias disponíveis e acompanhe seu progresso.</p>
        </Link>

        <Link to="/ranking" className="card-dashboard">
          <h3>Ranking</h3>
          <p>Veja sua ofensiva e as melhores posições.</p>
        </Link>

        <Link to="/perfil" className="card-dashboard">
          <h3>Perfil</h3>
          <p>Seus dados e opções de conta.</p>
        </Link>

        <Link to="/sobre" className="card-dashboard">
          <h3>Sobre</h3>
          <p>Saiba mais sobre o Gameficando Estudos.</p>
        </Link>
      </div>
    </div>
  );
}
