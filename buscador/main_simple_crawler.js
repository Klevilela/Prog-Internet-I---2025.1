const {inputUsuario, crawlPagina, buscar, paginas} = require('./simple_crawler')

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

async function main() {
  try {
    const urlInicial = 'https://klevilela.github.io/Prog-Internet-I---2025.1/buscador/paginas/blade_runner.html';

    console.log(`\nIniciando crawler a partir de: ${urlInicial}`);
    await crawlPagina(urlInicial);
    
    console.log(`\nCrawling concluído. Foram indexadas ${paginas.length} páginas.`);
    
    // Debug: verificar links
    console.log("\n--- DEBUG: Verificação de links entre páginas ---");
    paginas.forEach((pagina, i) => {
      console.log(`${i+1}. ${pagina.url}`);
      
      // Procurar links para esta página em outras páginas
      paginas.forEach(p => {
        if (p.url === pagina.url) return; // Pular a própria página
        
        const urlPattern = `href=["']${pagina.url}["']`;
        const regex = new RegExp(urlPattern, 'i');
        
        if (regex.test(p.html)) {
          console.log(`   - Recebe link de: ${p.url}`);
        }
      });
      
      // Verificar autoreferência
      const urlPattern = `href=["']${pagina.url}["']`;
      const regex = new RegExp(urlPattern, 'i');
      console.log(`   - Autoreferência: ${regex.test(pagina.html) ? "Sim" : "Não"}`);
    });

    console.log('\n--- SISTEMA DE BUSCA ---');

    while (true) {
      const termoBusca = await inputUsuario('\nDigite os termos para buscar (separados por espaço) ou "sair" para encerrar: ');

      if (termoBusca.toLowerCase() === 'sair') {
        console.log('Encerrando...');
        break;
      }

      const termos = termoBusca.split(' ').filter(t => t.trim().length > 0);
      const resultados = buscar(termos);
      mostraResultados(resultados);
    }
  } catch (erro) {
    console.error('Erro:', erro.message);
  }
}

main();