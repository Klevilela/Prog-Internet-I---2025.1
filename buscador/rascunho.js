const axios = require('axios');
const cheerio = require('cheerio');
const URL = require('url').URL;
const fs = require('fs');
const readline = require('readline');

// Conjunto para rastrear URLs já visitadas
const urlsVisitadas = new Set();

// Objeto para armazenar todas as páginas e seus dados
const paginas = {};

// Objetos para armazenar pontuações
const pontuacaoTermosPaginas = {}; // Pontuação por termos encontrados
const pontuacaoAutoridadePaginas = {}; // Pontuação por links recebidos
const pontuacaoAutoreferenciaPaginas = {}; // Pontuação por autoreferência

/**
 * Função para normalizar URLs relativas para absolutas
 * @param {string} href - URL (possivelmente relativa)
 * @param {string} baseUrl - URL base para resolver URLs relativas
 * @returns {string} - URL absoluta normalizada
 */
function normalizarUrl(href, baseUrl) {
  try {
    // Converter URL relativa para absoluta
    const urlCompleta = new URL(href, baseUrl).href;
    
    // Remover fragmentos (#)
    return urlCompleta.split('#')[0];
  } catch (erro) {
    // Retornar vazio se a URL for inválida
    return '';
  }
}

/**
 * Verifica se a URL pertence ao mesmo site/diretório base
 * @param {string} urlBase - URL base para comparação
 * @param {string} urlAlvo - URL a ser verificada
 * @returns {boolean} - True se pertencer ao mesmo site/diretório
 */
function mesmoSite(urlBase, urlAlvo) {
  try {
    const base = new URL(urlBase);
    const alvo = new URL(urlAlvo);
    
    // Extrair hostname e pathname sem o nome do arquivo
    const baseHostname = base.hostname;
    const basePath = base.pathname.substring(0, base.pathname.lastIndexOf('/'));
    
    const alvoHostname = alvo.hostname;
    const alvoPath = alvo.pathname;
    
    // Verificar se está no mesmo hostname e se o pathname começa com o mesmo diretório base
    return baseHostname === alvoHostname && alvoPath.startsWith(basePath);
  } catch (erro) {
    return false;
  }
}

/**
 * Verifica se há autoreferência na página
 * @param {string} url - URL da página
 * @param {Array} links - Lista de links na página
 * @returns {boolean} - True se houver autoreferência
 */
function verificaAutoreferencia(url, links) {
  // Verifica se há algum link que aponta para a própria página
  return links.some(link => link.href === url);
}

/**
 * Função para fazer crawling de uma página e suas páginas vinculadas
 * @param {string} urlInicial - URL inicial para começar o crawling
 * @param {number} profundidadeMaxima - Profundidade máxima para navegar (opcional, padrão: 2)
 */
async function crawlPagina(urlInicial, profundidadeMaxima = 2) {
  // Limpar dados anteriores
  Object.keys(paginas).forEach(key => delete paginas[key]);
  urlsVisitadas.clear();
  
  // Função recursiva para crawling
  async function crawl(url, profundidade) {
    // Verificar se já visitamos esta URL ou se atingimos a profundidade máxima
    if (urlsVisitadas.has(url) || profundidade > profundidadeMaxima) {
      return;
    }
    
    // Marcar como visitada
    urlsVisitadas.add(url);
    console.log(`\nAcessando [${profundidade}/${profundidadeMaxima}]: ${url}`);
    
    try {
      // Fazer requisição HTTP
      const resposta = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MeuCrawler/1.0)'
        },
        timeout: 5000 // 5 segundos de timeout
      });
      
      // Carregar conteúdo HTML
      const $ = cheerio.load(resposta.data);
      const links = [];
      
      // Extrair links
      $('a').each((i, elemento) => {
        const texto = $(elemento).text().trim();
        const href = $(elemento).attr('href');
        
        // Processar apenas se houver href
        if (href) {
          // Normalizar URL
          const urlCompleta = normalizarUrl(href, url);
          
          // Adicionar à lista se for válida e do mesmo site
          if (urlCompleta && mesmoSite(urlInicial, urlCompleta)) {
            links.push({ texto, href: urlCompleta });
          }
        }
      });
      
      // Verificar autoreferência
      const temAutoreferencia = verificaAutoreferencia(url, links);
      
      // Armazenar informações da página
      paginas[url] = {
        titulo: $('title').text().trim(),
        links: links,
        conteudo: resposta.data,
        temAutoreferencia: temAutoreferencia
      };
      
      console.log(`Título: "${paginas[url].titulo}"`);
      console.log(`Links encontrados: ${links.length}`);
      console.log(`Autoreferência: ${temAutoreferencia ? 'Sim' : 'Não'}`);
      
      // Mostrar alguns links (limitado a 5 para não poluir o console)
      const linksParaMostrar = links.slice(0, 5);
      linksParaMostrar.forEach((link, index) => {
        console.log(`  ${index + 1}. "${link.texto}" -> ${link.href}`);
      });
      
      if (links.length > 5) {
        console.log(`  ... e mais ${links.length - 5} links`);
      }
      
      // Seguir links se não atingimos a profundidade máxima
      if (profundidade < profundidadeMaxima) {
        // Pequena pausa para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Seguir cada link encontrado
        for (const link of links) {
          await crawl(link.href, profundidade + 1);
        }
      }
      
    } catch (erro) {
      console.error(`Erro ao acessar ${url}: ${erro.message}`);
    }
  }
  
  // Iniciar crawling com a URL inicial
  await crawl(urlInicial, 0);
  
  // Calcular pontuações de todas as páginas
  calcularPontuacoes();
  
  // Resumo final
  console.log("\n=====================");
  console.log(`Crawling concluído. Páginas encontradas: ${Object.keys(paginas).length}`);
  console.log("=====================");
  
  return paginas;
}

/**
 * Calcula pontuação por termos encontrados na página
 * @param {string} conteudo - Conteúdo HTML da página
 * @param {Array} termos - Lista de termos a procurar
 * @returns {number} - Pontuação baseada nos termos encontrados
 */
function calcularPontuacaoTermos(conteudo, termos) {
  // Pontuação: 5 pontos para cada termo encontrado
  let pontuacao = 0;
  const conteudoLowerCase = conteudo.toLowerCase();
  
  termos.forEach(termo => {
    const termoLowerCase = termo.toLowerCase();
    let ocorrencias = 0;
    let pos = conteudoLowerCase.indexOf(termoLowerCase);
    
    while (pos !== -1) {
      ocorrencias++;
      pos = conteudoLowerCase.indexOf(termoLowerCase, pos + 1);
    }
    
    pontuacao += ocorrencias * 5;
  });
  
  return pontuacao;
}

/**
 * Calcula pontuação por autoridade (links recebidos)
 * @param {string} url - URL da página a verificar
 * @returns {number} - Pontuação baseada nos links recebidos
 */
function calcularPontuacaoAutoridade(url) {
  // Pontuação: 10 pontos para cada link recebido de outra página
  let pontuacao = 0;
  
  Object.keys(paginas).forEach(paginaOrigem => {
    // Não considerar a própria página
    if (paginaOrigem !== url) {
      const links = paginas[paginaOrigem].links;
      
      // Verificar se algum link aponta para a URL
      const linksParaUrl = links.filter(link => link.href === url);
      pontuacao += linksParaUrl.length * 10;
    }
  });
  
  return pontuacao;
}

/**
 * Calcula penalização por autoreferência
 * @param {boolean} temAutoreferencia - Se a página tem autoreferência
 * @returns {number} - Pontuação de penalização
 */
function calcularPontuacaoAutoreferencia(temAutoreferencia) {
  // Penalização: -15 pontos se houver autoreferência
  return temAutoreferencia ? -15 : 0;
}

/**
 * Calcula todas as pontuações para todas as páginas
 * @param {Array} termos - Termos para calcular pontuação (opcional)
 */
function calcularPontuacoes(termos = []) {
  Object.keys(paginas).forEach(url => {
    // Calcular pontuação por termos encontrados
    pontuacaoTermosPaginas[url] = calcularPontuacaoTermos(paginas[url].conteudo, termos);
    
    // Calcular pontuação por autoridade
    pontuacaoAutoridadePaginas[url] = calcularPontuacaoAutoridade(url);
    
    // Calcular penalização por autoreferência
    pontuacaoAutoreferenciaPaginas[url] = calcularPontuacaoAutoreferencia(paginas[url].temAutoreferencia);
  });
}

/**
 * Calcula a pontuação total de uma página
 * @param {string} url - URL da página
 * @returns {number} - Pontuação total
 */
function calcularPontuacaoTotal(url) {
  return (pontuacaoTermosPaginas[url] || 0) + 
         (pontuacaoAutoridadePaginas[url] || 0) + 
         (pontuacaoAutoreferenciaPaginas[url] || 0);
}

/**
 * Realiza busca nos dados coletados
 * @param {Array} termos - Termos a serem buscados
 * @returns {Array} - Resultados ordenados por pontuação
 */
function buscar(termos) {
  if (!termos || termos.length === 0) {
    return [];
  }
  
  console.log(`\nBuscando por: ${termos.join(', ')}`);
  
  // Recalcular pontuações com os termos da busca
  calcularPontuacoes(termos);
  
  // Preparar resultados
  const resultados = [];
  
  Object.keys(paginas).forEach(url => {
    // Só incluir páginas que contêm pelo menos um dos termos
    if (pontuacaoTermosPaginas[url] > 0) {
      resultados.push({
        url: url,
        titulo: paginas[url].titulo,
        pontuacaoTermos: pontuacaoTermosPaginas[url],
        pontuacaoAutoridade: pontuacaoAutoridadePaginas[url],
        pontuacaoAutoreferencia: pontuacaoAutoreferenciaPaginas[url],
        pontuacaoTotal: calcularPontuacaoTotal(url)
      });
    }
  });
  
  // Ordenar resultados por pontuação total (maior para menor)
  resultados.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);
  
  return resultados;
}

/**
 * Função auxiliar para entrada interativa
 * @param {string} prompt - Texto a ser exibido como prompt
 * @returns {Promise<string>} - Promessa que resolve com a entrada do usuário
 */
function inputUsuario(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Função principal para execução
 */
async function main() {
  try {
    // URL inicial do Blade Runner conforme solicitado
    const urlInicial = 'https://klevilela.github.io/Prog-Internet-I---2025.1/buscador/paginas/blade_runner.html';
    
    const profundidadeMaxima = parseInt(await inputUsuario('Digite a profundidade máxima (padrão: 2): ') || '2');
    
    console.log(`\nIniciando crawler a partir de: ${urlInicial}`);
    await crawlPagina(urlInicial, profundidadeMaxima);
    
    console.log('\n--- SISTEMA DE BUSCA ---');
    
    // Interface de busca interativa
    while (true) {
      const termoBusca = await inputUsuario('\nDigite os termos para buscar (separados por espaço) ou "sair" para encerrar: ');
      
      if (termoBusca.toLowerCase() === 'sair') {
        break;
      }
      
      const termos = termoBusca.split(/\s+/).filter(termo => termo.trim() !== '');
      
      if (termos.length === 0) {
        console.log('Por favor, digite pelo menos um termo de busca.');
        continue;
      }
      
      const resultados = buscar(termos);
      
      console.log('\nResultados encontrados:');
      if (resultados.length === 0) {
        console.log('Nenhum resultado encontrado para os termos informados.');
      } else {
        resultados.forEach((resultado, index) => {
          console.log(`\n${index + 1}. "${resultado.titulo}" (${resultado.url})`);
          console.log(`   Pontuação total: ${resultado.pontuacaoTotal} pontos`);
          console.log(`   • Termos encontrados: ${resultado.pontuacaoTermos / 5} ocorrências (+${resultado.pontuacaoTermos} pontos)`);
          console.log(`   • Links recebidos: ${resultado.pontuacaoAutoridade / 10} links (+${resultado.pontuacaoAutoridade} pontos)`);
          console.log(`   • Autoreferência: ${resultado.pontuacaoAutoreferencia < 0 ? 'Sim' : 'Não'} (${resultado.pontuacaoAutoreferencia} pontos)`);
        });
      }
    }
    
    console.log("\nPrograma encerrado.");
    
  } catch (erro) {
    console.error(`Erro no programa: ${erro.message}`);
  }
}

// Executar o programa se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

// Exportar funções para uso em outros módulos
module.exports = {
  crawlPagina,
  buscar,
  calcularPontuacaoTermos,
  calcularPontuacaoAutoridade,
  calcularPontuacaoAutoreferencia
};

/* async function baixarPagina(url) {
  const { data } = await axios.get(url);
  return data;
} */
