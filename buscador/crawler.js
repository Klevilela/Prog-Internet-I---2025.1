const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const readline = require('readline'); // Adicionado para entrada interativa

// Diretório onde as páginas foram salvas pelo crawler
const pagesDir = './crawled_pages';

// Objetos para armazenar dados
const paginas = {}; // Armazena todas as páginas e seus dados
const pontuacaoAutoridadePaginas = {}; // Pontuação de autoridade para cada página
const linksRecebidos = {}; // Número de links recebidos por cada página

/**
 * Extrai todos os links de uma página
 * @param {string} content - Conteúdo HTML da página
 * @returns {Array} - Array de URLs para as quais a página aponta
 */
function extractLinks(content) {
  const $ = cheerio.load(content);
  const links = [];
  
  $('a').each((i, element) => {
    const href = $(element).attr('href');
    if (href) {
      // Extrair o nome do arquivo da URL
      const arquivoAlvo = href.split('/').pop();
      if (arquivoAlvo) {
        links.push(arquivoAlvo);
      }
    }
  });
  
  return links;
}

/**
 * Verifica se a página contém autoreferência
 * @param {string} content - Conteúdo HTML da página
 * @param {string} pageUrl - URL da página atual
 * @returns {boolean} - Verdadeiro se a página contém autoreferência
 */
function checkAutoreferencia(content, pageUrl) {
  const $ = cheerio.load(content);
  let autoReferencia = false;
  
  $('a').each((i, element) => {
    const text = $(element).text();
    if (text.includes('Autoreferência')) {
      autoReferencia = true;
      return false; // Interrompe o loop each()
    }
  });
  
  return autoReferencia;
}

/**
 * Carrega todas as páginas baixadas
 */
function carregaPaginas() {
  if (!fs.existsSync(pagesDir)) {
    console.error(`Diretório ${pagesDir} não encontrado. Execute o crawler primeiro.`);
    return false;
  }

  try {
    const files = fs.readdirSync(pagesDir);
    
    if (files.length === 0) {
      console.error(`O diretório ${pagesDir} está vazio. Execute o crawler primeiro.`);
      return false;
    }
    
    let loadedCount = 0;
    
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const filePath = path.join(pagesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // URL da página (usamos o nome do arquivo como identificador)
        const pageUrl = file;
        
        // Inicializar dados da página
        paginas[pageUrl] = {
          conteudo: content,
          links: extractLinks(content),
          temAutoReferencia: checkAutoreferencia(content, pageUrl)
        };
        
        // Inicializar pontuação de autoridade e contagem de links
        pontuacaoAutoridadePaginas[pageUrl] = 0;
        linksRecebidos[pageUrl] = 0;
        
        loadedCount++;
      }
    });
    
    console.log(`Carregadas ${loadedCount} páginas.`);
    return loadedCount > 0;
  } catch (error) {
    console.error(`Erro ao carregar páginas: ${error.message}`);
    return false;
  }
}

/**
 * Calcula a pontuação de autoridade para cada página
 * com base nos links recebidos de outras páginas
 */
function calculaAutoridade() {
  // Para cada página
  Object.keys(paginas).forEach(pageUrl => {
    // Reiniciar pontuação
    pontuacaoAutoridadePaginas[pageUrl] = 0;
    linksRecebidos[pageUrl] = 0;
    
    // Verificar quais páginas apontam para esta página
    Object.keys(paginas).forEach(sourcePageUrl => {
      const sourceLinks = paginas[sourcePageUrl].links;
      
      // Se a página de origem aponta para esta página, adicionar pontos
      if (sourceLinks.includes(pageUrl) && sourcePageUrl !== pageUrl) {
        pontuacaoAutoridadePaginas[pageUrl] += 10; // +10 pontos por link recebido
        linksRecebidos[pageUrl]++; // Incrementar contagem de links recebidos
      }
    });
  });
  
  console.log('Pontuação de autoridade calculada.');
}

/**
 * Conta a frequência dos termos de busca na página
 * @param {string} content - Conteúdo HTML da página
 * @param {Array} searchTerms - Termos de busca
 * @returns {number} - Número total de ocorrências dos termos de busca
 */
function contaTermosPesquisados(content, searchTerms) {
  let count = 0;
  const contentLower = content.toLowerCase();
  
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    
    // Contar ocorrências do termo
    let pos = contentLower.indexOf(termLower);
    while (pos !== -1) {
      count++;
      pos = contentLower.indexOf(termLower, pos + 1);
    }
  });
  
  return count;
}

/**
 * Realiza a busca e retorna os resultados ranqueados
 * @param {string} query - Consulta de busca
 * @returns {Array} - Resultados ranqueados
 */
function procura(query) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  // Dividir consulta em termos de busca
  const searchTerms = query.trim().split(/\s+/);
  console.log(`\nBuscando por: ${searchTerms.join(', ')}`);
  
  // Calcular pontuação para cada página
  const resultados = [];
  
  Object.keys(paginas).forEach(pageUrl => {
    const page = paginas[pageUrl];
    let score = 0;
    
    // a) Pontos de autoridade (+10 por link recebido)
    score += pontuacaoAutoridadePaginas[pageUrl];
    
    // b) Pontos por ocorrência dos termos (+5 por ocorrência)
    const contadorTermos = contaTermosPesquisados(page.content, searchTerms);
    score += contadorTermos * 5;
    
    // c) Penalização por autoreferência (-15 pontos)
    if (page.hasSelfReference) {
      score -= 15;
    }
    
    // Adicionar aos resultados se tiver pelo menos uma ocorrência dos termos
    if (contadorTermos > 0) {
      resultados.push({
        url: pageUrl,
        score: score,
        linksReceived: linksRecebidos[pageUrl],
        termCount: contadorTermos,
        hasSelfReference: page.hasSelfReference
      });
    }
  });
  
  // Ordenar resultados considerando critérios de desempate:
  // 1. Pontuação total (maior é melhor)
  // 2. Número de links recebidos (maior é melhor)
  // 3. Quantidade de termos no corpo (maior é melhor)
  // 4. Sem autoreferência é melhor que com autoreferência
  resultados.sort((a, b) => {
    // Comparação principal por pontuação
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    
    // Desempate 1: Mais links recebidos
    if (b.linksReceived !== a.linksReceived) {
      return b.linksReceived - a.linksReceived;
    }
    
    // Desempate 2: Mais ocorrências dos termos
    if (b.termCount !== a.termCount) {
      return b.termCount - a.termCount;
    }
    
    // Desempate 3: Autoreferência (sem autoreferência é melhor)
    return a.hasSelfReference - b.hasSelfReference;
  });
  
  return resultados;
}


/**
  //Cria uma interface de linha de comando para entrada interativa
 * @param {string} prompt - Texto a ser exibido como prompt
 * @returns {Promise<string>} - Promessa que resolve com a entrada do usuário
 */

  function inputTermo(prompt) {
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

module.exports = {carregaPaginas, calculaAutoridade, procura, inputTermo}