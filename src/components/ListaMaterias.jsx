import { Link } from "react-router-dom";

export function ListaMaterias({
  materias,
  onExcluir,
  onEditar,
  onGerenciarFontes,
}) {
  return (
    <ul>
      {materias.map((materia) => (
        <li key={materia.id}>
          <Link to={`/materias/${materia.id}`}>{materia.nome}</Link>
          {onEditar && (
            <button onClick={() => onEditar(materia)}>Editar</button>
          )}
          {onExcluir && (
            <button onClick={() => onExcluir(materia.id)}>Excluir</button>
          )}
          {onGerenciarFontes && (
            <Link to={`/materias/${materia.id}/fontes`}>
              Gerenciar materiais
            </Link>
          )}
          <Link to={`/materias/${materia.id}/atividades`}>Ver atividades</Link>
        </li>
      ))}
    </ul>
  );
}
