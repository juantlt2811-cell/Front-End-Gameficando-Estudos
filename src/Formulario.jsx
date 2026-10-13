// Formulario.jsx — ele cuida do PRÓPRIO estado de digitação (é só dele, ninguém mais precisa saber tecla por tecla)
import { useState } from "react";

export function Formulario({ onEnviar }) {
  const [valor, setValor] = useState("");

  function handleSubmit(e) {
    e.preventDefault(); // impede o comportamento padrão do <form> (recarregar a página)
    onEnviar(valor); // avisa o pai, mandando o valor final
    setValor(""); // limpa o campo depois de enviar
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={valor} onChange={(e) => setValor(e.target.value)} />
      <button type="submit">Enviar</button>
    </form>
  );
}
