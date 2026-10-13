import { useParams } from "react-router-dom";
import { useUsuario } from "../context/UsuarioContext";

export function Materia() {
  const { id } = useParams();
  const usuario = useUsuario();

  return (
    <div>
      <h1>Você está vendo a matéria #{id}</h1>
      <p>Usuário: {usuario.nome}</p>
      <p>Tipo: {usuario.tipo}</p>
    </div>
  );
}
