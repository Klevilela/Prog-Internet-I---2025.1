const {
  carregaPaginas,
  calculaAutoridade,
  procura,
  inputTermo,
} = require("./crawler");

/**
 * Exibe os resultados da busca de forma formatada
 * @param {Array} results - Resultados da busca
 */
function mostraResultados(results) {
  if (results.length === 0) {
    console.log("Nenhum resultado encontrado.");
    return;
  }

  console.log(`\n===== Resultados da Busca (${results.length}) =====`);

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.url}`);
    console.log(`   Pontuação Total: ${result.score}`);
    console.log(`   Detalhe da Pontuação:`);
    console.log(
      `     - Autoridade: ${result.linksReceived * 10} pontos (${
        result.linksReceived
      } links recebidos)`
    );
    console.log(
      `     - Ocorrências dos termos: ${result.termCount * 5} pontos (${
        result.termCount
      } ocorrências)`
    );

    if (result.hasSelfReference) {
      console.log(`     - Penalização por autoreferência: -15 pontos`);
    }

    // Mostrar critérios de desempate
    console.log(`   Critérios de Desempate:`);
    console.log(`     1. Links recebidos: ${result.linksReceived}`);
    console.log(`     2. Ocorrências de termos: ${result.termCount}`);
    console.log(
      `     3. Autoreferência: ${result.hasSelfReference ? "Sim" : "Não"}`
    );
  });

  console.log("\n=====================================");
}

/**
 * Inicializa o buscador carregando páginas e calculando autoridade
 * @returns {boolean} - Verdadeiro se a inicialização foi bem-sucedida
 */
function inicializaBuscador() {
  const loaded = carregaPaginas();
  if (loaded) {
    calculaAutoridade();
    return true;
  }
  return false;
}


/**
 * Modo interativo para busca contínua
 */
async function buscadorTermos() {
  console.log("\n=== Modo Interativo do Buscador ===");
  console.log('Digite "sair" ou "exit" para encerrar\n');

  let running = true;

  while (running) {
    const query = await askQuestion("Digite o termo de busca: ");

    if (query.toLowerCase() === "sair" || query.toLowerCase() === "exit") {
      running = false;
      console.log("Encerrando o buscador...");
      continue;
    }

    if (query.trim() === "") {
      console.log("Por favor, digite um termo de busca válido.");
      continue;
    }

    // Realizar a busca
    const results = search(query);

    // Exibir resultados
    mostraResultados(results);
  }
}

/**
 * Função principal
 */
async function main() {
  // Inicializar o buscador
  const inicializado = inicializaBuscador();

  if (!inicializado) {
    return;
  }

  // Obter consulta de busca da linha de comando
  const args = process.argv.slice(2);
  const termo = args.join(" ");

  if (!termo) {
    // Se não houver argumentos, entrar no modo interativo
    console.log("Nenhum termo de busca fornecido como argumento.");
    await buscadorTermos();
  } else {
    // Realizar a busca com os argumentos fornecidos
    const results = procura(termo);

    // Exibir resultados
    mostraResultados(results);

    // Perguntar se o usuário deseja continuar em modo interativo
    const continueInteractive = await inputTermo(
      "\nDeseja continuar em modo interativo? (s/n): "
    );
    if (
      continueInteractive.toLowerCase() === "s" ||
      continueInteractive.toLowerCase() === "sim"
    ) {
      await buscadorTermos();
    }
  }
}

// Executar o buscador
main();
