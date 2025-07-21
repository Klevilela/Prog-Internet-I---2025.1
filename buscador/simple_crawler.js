const axios = require('axios');
const cheerio = require('cheerio');
const readline = require('readline');
const { URL } = require('url');

// Armazenamento das páginas visitadas
const paginas = [];
const visitadas = new Set();

function inputUsuario(pergunta) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(pergunta, ans => {
    rl.close();
    resolve(ans);
  }));
}


function urlToAbsolute(base, href) {
  try {
    return new URL(href, base).href;
  } catch (e) {
    return null;
  }
}

async function crawlPagina(url) {
  if (visitadas.has(url)) return;
  visitadas.add(url);

  try {
    console.log(`Crawling: ${url}`);
    const { data } = await axios.get(url);
    const html = data;
    const $ = cheerio.load(html);

    const titulo = $('title').text().trim();
    const texto = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Armazenar o HTML bruto também para busca no código-fonte
    paginas.push({ url, titulo, texto, html });

    // Extrair todos os links da página
    const links = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        const novaUrl = urlToAbsolute(url, href);
        if (novaUrl) {
          links.push(novaUrl);
          // Debug: Mostrar os links encontrados
          console.log(`  - Link encontrado: ${novaUrl}`);
        }
      }
    });

    // Navegar para os links encontrados
    for (const novaUrl of links) {
      if (!visitadas.has(novaUrl)) {
        await crawlPagina(novaUrl);
      }
    }
  } catch (erro) {
    console.error(`Erro ao acessar ${url}:`, erro.message);
  }
}

function buscar(termos) {
  // Função auxiliar para verificar se há um link de p para pagina
  function temLink(p, pagina) {
    // Extrai todos os links da página p
    const $ = cheerio.load(p.html);
    const links = $('a[href]').map((i, el) => {
      const href = $(el).attr('href');
      return urlToAbsolute(p.url, href);
    }).get();
    
    // Verifica se algum dos links aponta para pagina.url
    return links.includes(pagina.url);
  }

  // Debug: mostrar todas as páginas e seus links
  console.log("\n--- DEBUG: Links entre páginas ---");
  paginas.forEach(pagina => {
    const paginasQueLinkam = paginas.filter(p => {
      // Pular a própria página
      if (p.url === pagina.url) return false;
      
      // Verificar se a página p tem um link para pagina
      return temLink(p, pagina);
    });

    console.log(`${pagina.url} recebe ${paginasQueLinkam.length} links de:`);
    paginasQueLinkam.forEach(p => console.log(`  - ${p.url}`));
  });

  return paginas
    .map(pagina => {
      const texto = pagina.texto.toLowerCase();
      const html = pagina.html.toLowerCase();
      
      // Contar ocorrências dos termos no código-fonte (HTML)
      const termCount = termos.reduce((acc, termo) => {
        const regex = new RegExp(termo.toLowerCase(), 'g');
        const ocorrencias = (html.match(regex) || []).length;
        return acc + ocorrencias;
      }, 0);
      
      // Verificar autoreferência usando cheerio para extrair links
      const $ = cheerio.load(pagina.html);
      const links = $('a[href]').map((i, el) => {
        const href = $(el).attr('href');
        return urlToAbsolute(pagina.url, href);
      }).get();
      const hasSelfReference = links.includes(pagina.url);
      
      // Contar links recebidos de outras páginas
      const linksReceived = paginas.filter(p => {
        if (p.url === pagina.url) return false; // Pular a própria página
        return temLink(p, pagina);
      }).length;
      
      // Calcular pontuação total
      const score = 
        (termCount * 5) +             // 5 pontos por termo no código-fonte
        (linksReceived * 10) +        // 10 pontos por cada link recebido
        (hasSelfReference ? -15 : 0); // -15 pontos se tiver autoreferência

      return {
        ...pagina,
        score,
        termCount,
        linksReceived,
        hasSelfReference
      };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => {
      // Ordenar por pontuação total
      if (b.score !== a.score) return b.score - a.score;
      
      // Critérios de desempate
      // 1. Links recebidos
      if (b.linksReceived !== a.linksReceived) return b.linksReceived - a.linksReceived;
      
      // 2. Ocorrências de termos
      if (b.termCount !== a.termCount) return b.termCount - a.termCount;
      
      // 3. Penalização por autoreferência
      if (a.hasSelfReference !== b.hasSelfReference) return a.hasSelfReference ? 1 : -1;

      if (b.totalTermos !== a.totalTermos) return b.totalTermos - a.totalTermos;
      
      return 0;
    });
}

module.exports = {crawlPagina, inputUsuario, buscar, paginas}