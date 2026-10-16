import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Materia() {
  const { id } = useParams();
  const { usuario } = useAuth();

  return (
    <div>
      <h1>Você está vendo a matéria #{id}</h1>
      <p>Usuário: {usuario.nome}</p>
      <p>Tipo: {usuario.tipo}</p>
    </div>
  );
}
