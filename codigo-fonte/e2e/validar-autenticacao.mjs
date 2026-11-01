import {
  obterPapelAutenticado,
  obterUsuarioPorPapel,
  obterPapeisDisponiveis,
  obterUsuarios,
  obterCaminhoArmazenamentoEstado
} from './config/usuarios.js';

try {
  const papel = obterPapelAutenticado();
  const usuario = obterUsuarioPorPapel(papel);
  const usuariosPorPapel = obterUsuarios();
  console.log('\nConfiguracao de autenticacao validada com sucesso!\n');
  console.log('Papel autenticado:', usuario.papel);
  console.log('E-mail:', usuario.email);
  console.log('Nome:', usuario.nome);
  console.log('StorageState:', obterCaminhoArmazenamentoEstado('istoque', usuario.papel));
  console.log('\nPapeis disponiveis:');
  obterPapeisDisponiveis().forEach((nome) => {
    console.log(`  - ${nome}: ${usuariosPorPapel[nome].nome}`);
  });
  console.log('\nPronto para rodar testes!\n');
  process.exit(0);
} catch (erro) {
  console.error('\nErro na validacao:', erro.message, '\n');
  process.exit(1);
}
