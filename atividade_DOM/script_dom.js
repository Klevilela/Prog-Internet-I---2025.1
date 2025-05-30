let pTexto = document.getElementById("texto");
let h3_texto = document.getElementsByTagName("h3");

pTexto.innerText = "Texto";
h3_texto[2].textContent = "Texto em h3";

console.log(pTexto);
console.log(h3_texto);

let div_pai = document.getElementById("div_pai");
let paragrafosfilhos = div_pai.children;
let div_resultado = document.getElementById("div2");

for (let i = 0; i < paragrafosfilhos.length; i++) {
  div_resultado.innerHTML += paragrafosfilhos[i].innerText + "</br>";
}

let botao = document.getElementById("botao");

botao.addEventListener("click", function () {
  var paragrafo = document.getElementById("paragrafo");
  paragrafo.textContent = "O texto desse parágrafo foi alterado";
});

let botao_limpar = document.getElementById("botao_limpar");

botao_limpar.addEventListener("click", function () {
  paragrafo.textContent = "";
});

let texto_colorido = document.getElementById("texto_colorido");
texto_colorido.style.color = "red";

let input_texto_normal = document.getElementById("texto_normal");
let input_texto_caixa_alta = document.getElementById("texto_caixa-alta");

let botao_copiar = document.getElementById("botao_copiar");
botao_copiar.addEventListener("click", function () {
  let texto_caixa_alta = input_texto_normal.value.toUpperCase();
  input_texto_caixa_alta.value = texto_caixa_alta;
});

let botao_muda_tema = document.getElementById("botao_muda_tema");
let botao_reseta_tema = document.getElementById("botao_reseta_tema");
let body = document.body;

let tem_contraste = false;

botao_muda_tema.addEventListener("click", function () {
  if (!tem_contraste) {
    body.style.backgroundColor = "black";
    body.style.color = "white";
    tem_contraste = true;
  } else {
    body.style.backgroundColor = "white";
    body.style.color = "black";
    tem_contraste = false;
  }
});

botao_reseta_tema.addEventListener("click", function () {
  body.style.backgroundColor = "";
  body.style.color = "";
  tem_contraste = false;
});

let botao_aumenta_letra = document.getElementById("botao_aumenta_letra");
let botao_diminui_letra = document.getElementById("botao_diminui_letra");
let tamanho_fonte = 12;

botao_aumenta_letra.addEventListener("click", function () {
  tamanho_fonte += 2;
  body.style.fontSize = tamanho_fonte + "px";
});
botao_diminui_letra.addEventListener("click", function () {
  if (tamanho_fonte > 10) {
    tamanho_fonte -= 2;
    body.style.fontSize = tamanho_fonte + "px";
  }
});

let botao_calcular = document.getElementById("botao_calcular");

botao_calcular.addEventListener("click", function () {
  let input_v1 = document.getElementById("v1").value;
  let input_v2 = document.getElementById("v2").value;

  let operacoes = document.getElementsByName("operacao");
  let operacao_selecionada = null;

  let v1 = Number(input_v1);
  let v2 = Number(input_v2);

  let resultado;

  for (let op of operacoes) {
    if (op.checked) {
      operacao_selecionada = op.value;
      break;
    }
  }

  if (operacao_selecionada === "soma") {
    resultado = v1 + v2;
  }
  if (operacao_selecionada === "subtracao") {
    resultado = v1 - v2;
  }
  if (operacao_selecionada === "multiplicacao") {
    resultado = v1 * v2;
  }
  if (operacao_selecionada === "divisao") {
    resultado = v1 / v2;
  }

  document.getElementById("resultado").innerText = `Resultado: ${resultado}`;
});

let botao_adicionar = document.getElementById("botao_adicionar");
let input = document.getElementById("texto_lista");
let lista = document.getElementById('lista');

botao_adicionar.addEventListener("click", function () {
  let valor = input.value;
  if (valor === "") return;

  const li = document.createElement("li");
  li.textContent = valor;
  lista.appendChild(li);

  input.value = "";
  input.focus(); // opcional: deixa o cursor no input para digitar de novo
});

const botaoAdd = document.getElementById("botao_add");
const textoListaSelect = document.getElementById("texto_lista_select");
const listaSelect = document.getElementById("lista_select");

botaoAdd.addEventListener("click", function() {
    const valor = textoListaSelect.value.trim(); 
    
    if (valor === "") {
      alert("Por favor, digite algo antes de adicionar!");
      return;
    }
    
    const option = document.createElement("option");
    option.textContent = valor;
    option.value = valor;
    
    listaSelect.appendChild(option);
    
    textoListaSelect.value = ""; 
    textoListaSelect.focus();
});
