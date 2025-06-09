function getByid(id){return document.getElementById(id)}

let botaoCriarParagrafo = getByid('botaoCriarParagrafo')
botaoCriarParagrafo.addEventListener('click', () =>{
    let resultado1 = getByid('resultado1')

    let p = document.createElement('p')
    p.setAttribute('id', 'meuParagrafo')
    p.innerText = 'hellow world'

    resultado1.appendChild(p)
})

let botaoCriarElementos = getByid('botaoCriarElementos')
botaoCriarElementos.addEventListener('click', ()=>{
    let elemento = getByid('elemento').value
    let textoElemento = getByid('textoElemento').value
    let idElemento = getByid('idElemento').value
    let parentElemento = getByid(getByid('parentElemento').value)

    let elementoCriado = document.createElement(elemento)
    elementoCriado.innerText = textoElemento
    elementoCriado.id = idElemento
    parentElemento.appendChild(elementoCriado)
  
})

let contador = 1
let botaoTask = getByid('botaoAddTask')
botaoTask.addEventListener('click', ()=>{
    let task = getByid('task').value
    let percentualExecucao = getByid('percentualExecucao').value
    let tableTasks = getByid('tabelaTasks')

    let tr = document.createElement('tr')
    tr.id = contador

    let tdContador = document.createElement('td')
    tdContador.innerText = contador
    
    let tdTask = document.createElement('td')
    tdTask.innerText = task
    
    let tdPercentualExecucao = document.createElement('td')
    tdPercentualExecucao.innerText = percentualExecucao + '%'

    tr.appendChild(tdContador)
    tr.appendChild(tdTask)
    tr.appendChild(tdPercentualExecucao)

    tableTasks.appendChild(tr)
    contador++
})