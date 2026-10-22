// Para onde o mascote olha, a partir do que a pessoa faz no formulário. Função
// pura: quem desenha e anima é o componente Mascot. As medidas são unidades do
// SVG do mascote, não pixels da tela.

// Quanto o olho anda para cada lado no e-mail (L): a caixa de uma só é menor.
const LIMITE_DO_OLHAR = { duas: 34, uma: 30 };
// O olho chega ao extremo direito com este tamanho de e-mail; depois disso fica.
const EMAIL_MAXIMO = 22;
const OLHAR_PARA_BAIXO = 14;

export function mascotFace(
  { focus, emailLength = 0, passwordVisible = false },
  variant = "duas",
) {
  // A ordem das regras importa e não é óbvia: a senha visível vence o foco na
  // senha (quem acabou de mostrar a senha está com o foco nela, e o mascote
  // deve "espiar", não fechar o olho), e o foco na senha vence o e-mail. Mas a
  // senha visível só vale com o foco numa senha ou em nenhum campo: com o foco
  // no e-mail, o olho volta a seguir o e-mail.
  const emSenha = focus === "senha" || focus === "confirmacao";
  if (passwordVisible && (emSenha || !focus))
    return { x: 0, y: 0, olho: "arregalado" };
  if (emSenha) return { x: 0, y: OLHAR_PARA_BAIXO, olho: "fechado" };
  if (focus === "email") {
    const limite = LIMITE_DO_OLHAR[variant] ?? LIMITE_DO_OLHAR.duas;
    const andamento = Math.min(emailLength, EMAIL_MAXIMO) / EMAIL_MAXIMO;
    return {
      x: (andamento * 2 - 1) * limite,
      y: OLHAR_PARA_BAIXO,
      olho: "aberto",
    };
  }
  return { x: 0, y: 0, olho: "aberto" };
}
