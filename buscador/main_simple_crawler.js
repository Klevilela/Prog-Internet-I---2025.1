const {
  inputUsuario,
  crawlPagina,
  buscar,
  paginas,
} = require("./simple_crawler");

function mostraResultados(results) {
  if (results.length === 0) {
    console.log("Nenhum resultado encontrado.");
    return;
  }

  console.log(`\n===== Resultados da Busca (${results.length}) =====`);

  const tabela = results.map((result, index) => ({
    "Posição": index + 1,
    URL: result.url,
    "Pontuação Total": result.score,
    "Links Recebidos": result.linksReceived,
    "Pontuação Autoridade": result.linksReceived * 10,
    "Ocorrências de Termos": result.termCount,
    "Pontuação Termos": result.termCount * 5,
    Autoreferência: result.hasSelfReference ? "Sim (-15)" : "Não",
  }));
  console.table(tabela);
}

function mostrarDebugLinks() {
  console.log("\n--- DEBUG: Verificação de links entre páginas ---");
  paginas.forEach((pagina, i) => {
    console.log(`${i + 1}. ${pagina.url}`);

    // Procurar links para esta página em outras páginas
    paginas.forEach((p) => {
      if (p.url === pagina.url) return; // Pular a própria página

      const urlPattern = `href=["']${pagina.url}["']`;
      const regex = new RegExp(urlPattern, "i");

      if (regex.test(p.html)) {
        console.log(`   - Recebe link de: ${p.url}`);
      }
    });

    // Verificar autoreferência
    const urlPattern = `href=["']${pagina.url}["']`;
    const regex = new RegExp(urlPattern, "i");
    console.log(
      `   - Autoreferência: ${regex.test(pagina.html) ? "Sim" : "Não"}`
    );
  });
}

async function adicionarNovaUrl() {
  const novaUrl = await inputUsuario("Digite a URL para indexar: ");

  if (novaUrl.trim().length === 0) {
    console.log("URL inválida.");
    return;
  }

  try {
    console.log(`\nIniciando crawler a partir de: ${novaUrl}`);
    await crawlPagina(novaUrl);
    console.log(
      `\nCrawling concluído. Total de páginas indexadas: ${paginas.length}`
    );
    mostrarDebugLinks();
  } catch (erro) {
    console.error("Erro ao indexar nova URL:", erro.message);
  }
}

function mostrarMenu() {
  console.log("\n=== SISTEMA DE BUSCA E INDEXAÇÃO ===");
  console.log("1. Pesquisar termo");
  console.log("2. Indexar nova URL");
  console.log("3. Ver debug dos links");
  console.log("4. Sair");
  console.log("====================================");
}

async function main() {
  try {
    const urlInicial =
      "https://klevilela.github.io/Prog-Internet-I---2025.1/buscador/paginas/blade_runner.html";

    console.log(`\nIniciando crawler a partir de: ${urlInicial}`);
    await crawlPagina(urlInicial);

    console.log(
      `\nCrawling concluído. Foram indexadas ${paginas.length} páginas.`
    );
    mostrarDebugLinks();

    while (true) {
      mostrarMenu();
      const opcao = await inputUsuario("\nEscolha uma opção (1-4): ");

      switch (opcao) {
        case "1":
          console.log("\n> Opção 1: Pesquisar termo");
          const termosBusca = await inputUsuario(
            "Digite os termos para buscar (separados por espaço): "
          );
          const termos = termosBusca
            .split(" ")
            .filter((t) => t.trim().length > 0);

          if (termos.length === 0) {
            console.log("Digite pelo menos um termo para buscar.");
          } else {
            const resultados = buscar(termos);
            mostraResultados(resultados);
          }
          break;

        case "2":
          console.log("\n> Opção 2: Indexar nova URL");
          await adicionarNovaUrl();
          break;

        case "3":
          console.log("\n> Opção 3: Ver debug dos links");
          mostrarDebugLinks();
          break;

        case "4":
          console.log("\n> Opção 4: Sair");
          console.log("Encerrando...");
          return;

        default:
          console.log("\nOpção inválida! Escolha entre 1 e 4.");
          break;
      }
    }
  } catch (erro) {
    console.error("Erro:", erro.message);
  }
}

main();
