let h1_principal = document.getElementById('principal')
h1_principal.innerText = 'Aprendendo DOM'
console.log(h1_principal)
console.log(typeof(h1_principal))

let divResultado1 = document.getElementById('resultado1')
divResultado1.innerText ='Escrevendo dentro da div'

let divpai = document.getElementById('pai')
let paragrafosfilhos = divpai.children

let divResultadoFilhos = document.getElementById('resultadofilhos')
for(var i=0; i < paragrafosfilhos.length; i++){
    divResultadoFilhos.innerHTML += 
        `<a href=#>`+paragrafosfilhos[i].innerText + '<br>'
}

/* 
let botao1 = document.getElementById('botao1')
botao1.addEventListener('click', ()=>{
    alert('clicou no botao')
    }
)
 */
   
let botao1 = document.getElementById('botao1')
botao1.addEventListener('click', cliqueBotao1)

function cliqueBotao1(){
    alert('clicou no botão')
}

let botaoSomar = document.getElementById('botaoSomar')


botao1.addEventListener('click', somar)

function somar(){
    let textonumero1 = document.getElementById('numero1')
    let textonumero2 = document.getElementById('numero2')
    
    let soma = Number(textonumero1.value) + Number(textonumero2.value)
    let resultado_soma = document.getElementById('resultadoSoma')

    resultado_soma.innerText = soma
    console.log(resultado_soma)

}