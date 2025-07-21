const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório onde as páginas foram salvas pelo crawler
const pagesDir = './crawled_pages';

/**
 * Extrai todos os links de uma página
 * @param {string} content - Conteúdo HTML da página
 * @returns {Array} - Array de URLs
 */
function extractLinks(content) {
  const $ = cheerio.load(content);
  const links = [];
  
  $('a').each((i, element) => {
    const href = $(element).attr('href');
    if (href) {
      // Extrair o nome do arquivo da URL
      const targetFile = href.split('/').pop();
      if (targetFile) {
        links.push(targetFile);
      }
    }
  });
  
  return links;
}

/**
 * Conta ocorrências exatas da palavra no texto
 * @param {string} content - Conteúdo HTML
 * @param {string} term - Termo a buscar
 * @returns {number} - Número de ocorrências
 */
function countExactOccurrences(content, term) {
  const contentLower = content.toLowerCase();
  const termLower = term.toLowerCase();
  
  // Contar ocorrências do termo
  let count = 0;
  let pos = contentLower.indexOf(termLower);
  while (pos !== -1) {
    count++;
    pos = contentLower.indexOf(termLower, pos + 1);
  }
  
  return count;
}

/**
 * Extrai e mostra o texto ao redor de cada ocorrência
 * @param {string} content - Conteúdo HTML
 * @param {string} term - Termo a buscar
 */
function showOccurrencesInContext(content, term) {
  const contentLower = content.toLowerCase();
  const termLower = term.toLowerCase();
  
  let pos = contentLower.indexOf(termLower);
  let occurrenceNum = 1;
  
  while (pos !== -1) {
    // Extrair contexto (20 caracteres antes e depois)
    const start = Math.max(0, pos - 20);
    const end = Math.min(contentLower.length, pos + termLower.length + 20);
    const context = content.substring(start, end);
    
    console.log(`    Ocorrência #${occurrenceNum}: ...${context}...`);
    
    // Próxima ocorrência
    pos = contentLower.indexOf(termLower, pos + 1);
    occurrenceNum++;
  }
}

/**
 * Analisa uma página específica
 * @param {string} pageUrl - URL da página a analisar
 * @param {string} searchTerm - Termo de busca
 */
function analyzePage(pageUrl, searchTerm) {
  try {
    const filePath = path.join(pagesDir, pageUrl);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Arquivo não encontrado: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const links = extractLinks(content);
    const occurrences = countExactOccurrences(content, searchTerm);
    
    console.log(`\n=== Análise da Página: ${pageUrl} ===`);
    console.log(`Termo de busca: "${searchTerm}"`);
    console.log(`Número de ocorrências: ${occurrences}`);
    
    // Mostrar contexto de cada ocorrência
    console.log('\nOcorrências no contexto:');
    showOccurrencesInContext(content, searchTerm);
    
    // Mostrar links na página
    console.log('\nLinks presentes na página:');
    if (links.length === 0) {
      console.log('  Nenhum link encontrado');
    } else {
      links.forEach(link => {
        console.log(`  → ${link}`);
      });
    }
    
    // Verificar quais páginas apontam para esta
    console.log('\nPáginas que apontam para esta:');
    
    // Ler todas as páginas
    const files = fs.readdirSync(pagesDir);
    let linkingPages = 0;
    
    files.forEach(file => {
      if (file.endsWith('.html') && file !== pageUrl) {
        const sourceContent = fs.readFileSync(path.join(pagesDir, file), 'utf8');
        const sourceLinks = extractLinks(sourceContent);
        
        if (sourceLinks.includes(pageUrl)) {
          console.log(`  → ${file}`);
          linkingPages++;
        }
      }
    });
    
    if (linkingPages === 0) {
      console.log('  Nenhuma página aponta para esta');
    } else {
      console.log(`  Total: ${linkingPages} página(s) apontam para esta`);
    }
    
  } catch (error) {
    console.error(`Erro ao analisar página ${pageUrl}: ${error.message}`);
  }
}

/**
 * Analisa todas as páginas em busca de um termo específico
 * @param {string} searchTerm - Termo de busca
 */
function analyzeAllPages(searchTerm) {
  if (!fs.existsSync(pagesDir)) {
    console.error(`Diretório ${pagesDir} não encontrado. Execute o crawler primeiro.`);
    return;
  }
  
  const files = fs.readdirSync(pagesDir);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  
  if (htmlFiles.length === 0) {
    console.error(`Não há arquivos HTML no diretório ${pagesDir}.`);
    return;
  }
  
  console.log(`\n===== Analisando todas as páginas para o termo "${searchTerm}" =====`);
  
  let totalOccurrences = 0;
  let pagesWithTerm = 0;
  
  htmlFiles.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      const occurrences = countExactOccurrences(content, searchTerm);
      
      if (occurrences > 0) {
        console.log(`  → ${file}: ${occurrences} ocorrência(s)`);
        totalOccurrences += occurrences;
        pagesWithTerm++;
      }
    } catch (error) {
      console.error(`Erro ao processar ${file}: ${error.message}`);
    }
  });
  
  console.log(`\nResumo:`);
  console.log(`  Total de ocorrências encontradas: ${totalOccurrences}`);
  console.log(`  Páginas contendo o termo: ${pagesWithTerm} de ${htmlFiles.length}`);
}

/**
 * Analisa e exibe links recebidos por todas as páginas
 */
function analyzeAllLinks() {
  if (!fs.existsSync(pagesDir)) {
    console.error(`Diretório ${pagesDir} não encontrado. Execute o crawler primeiro.`);
    return;
  }
  
  const files = fs.readdirSync(pagesDir);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  
  if (htmlFiles.length === 0) {
    console.error(`Não há arquivos HTML no diretório ${pagesDir}.`);
    return;
  }
  
  // Primeiro, extrair todos os links
  const allLinks = {};
  const linksReceived = {};
  
  // Inicializar contadores
  htmlFiles.forEach(file => {
    linksReceived[file] = 0;
  });
  
  // Construir mapa de links
  htmlFiles.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      const links = extractLinks(content);
      allLinks[file] = links;
      
      // Incrementar contadores de links recebidos
      links.forEach(targetFile => {
        if (linksReceived[targetFile] !== undefined && file !== targetFile) {
          linksReceived[targetFile]++;
        }
      });
    } catch (error) {
      console.error(`Erro ao processar ${file}: ${error.message}`);
    }
  });
  
  console.log(`\n===== Análise de Links entre Páginas =====`);
  
  // Mostrar todos os links
  console.log('\n1. Links saindo de cada página:');
  
  htmlFiles.forEach(file => {
    const links = allLinks[file] || [];
    console.log(`  → ${file}: ${links.length} link(s) saindo`);
    
    if (links.length > 0) {
      console.log(`     Aponta para: ${links.join(', ')}`);
    }
  });
  
  // Mostrar links recebidos
  console.log('\n2. Links recebidos por cada página:');
  
  // Ordenar por número de links recebidos (maior para menor)
  const sortedPages = htmlFiles.sort((a, b) => linksReceived[b] - linksReceived[a]);
  
  sortedPages.forEach(file => {
    console.log(`  → ${file}: ${linksReceived[file]} link(s) recebidos`);
    
    // Mostrar quais páginas apontam para esta
    if (linksReceived[file] > 0) {
      const pointingPages = htmlFiles.filter(source => 
        source !== file && allLinks[source] && allLinks[source].includes(file)
      );
      console.log(`     Recebe links de: ${pointingPages.join(', ')}`);
    }
  });
}

/**
 * Função principal
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Por favor, especifique um comando:');
    console.log('  - "page [URL] [termo]": Analisa uma página específica');
    console.log('  - "term [termo]": Analisa todas as páginas para um termo');
    console.log('  - "links": Analisa todos os links entre páginas');
    return;
  }
  
  if (command === 'page' && args.length >= 3) {
    const pageUrl = args[1];
    const term = args.slice(2).join(' ');
    analyzePage(pageUrl, term);
  } else if (command === 'term' && args.length >= 2) {
    const term = args.slice(1).join(' ');
    analyzeAllPages(term);
  } else if (command === 'links') {
    analyzeAllLinks();
  } else {
    console.log('Comando inválido ou parâmetros insuficientes.');
    console.log('Exemplos de uso:');
    console.log('  node analisador-debug.js page pagina1.html matrix');
    console.log('  node analisador-debug.js term matrix');
    console.log('  node analisador-debug.js links');
  }
}

// Executar
main();