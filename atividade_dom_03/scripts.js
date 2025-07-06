console.log("scripts.js carregado!");


function getById(id){
  return document.getElementById(id)
}
let idCounter = 1

let tarefas = []
let tarefasExcluidas = []



const btnAdicionar = getById('adicionarBtn')
btnAdicionar.addEventListener('click', adicionaTarefa)

const selectOrdenar = getById('ordenarPor')
selectOrdenar.addEventListener('change', renderizarTabela)

const selectFiltrar = getById('filtrarPor')
selectFiltrar.addEventListener('change', renderizarTabela)

function adicionaTarefa(){
  console.log('botao clicado')
  const descricaoTarefa = getById('descricaoTarefa').value
  const dataInicio = getById('inputData').value

  if(descricaoTarefa === ''){
    alert('Não pode adicionar tarefa sem descricao')
    return
  }

  /* if(dataInicio === ''){
    alert('Não pode adicionar tarefa sem uma data de início')
    return
  } */

  let data = String(dataInicio).split('-')
  const dataFormatada = data[2] + '/' + data[1]+'/'+data[0]
  

  const tarefa = {
    id: idCounter++,
    descricao: descricaoTarefa,
    dataInicio: dataFormatada,
    dataConclusao: ""
  };
  
  
  tarefas.push(tarefa)
  renderizarTabela()
  console.log(tarefa)

  
  getById('descricaoTarefa').value = ''
  getById('inputData').value = '' 
}


function renderizarTabela() {
  const criterio = selectOrdenar.value
  const filtragem = selectFiltrar.value
  
  let tarefasFiltradas = tarefas.filter(tarefa => 
    {
      if (filtragem === 'pendentes'){
        return tarefa.dataConclusao === ''
      }
      if (filtragem === 'finalizadas'){
        return tarefa.dataConclusao !== ''
      }else{
        return true
      }
    }
  )

  let tarefasOrdenadas = [...tarefasFiltradas]


  if(criterio === 'descricao'){
    tarefasOrdenadas.sort((a,b)=>
      a.descricao.toLowerCase().localeCompare(b.descricao.toLowerCase())
    )
  }else if(criterio === 'data'){
    tarefasOrdenadas.sort((a,b)=>
      new Date(b.dataInicio) - new Date(a.dataInicio)
    )
  }else{
    tarefasOrdenadas.sort((a,b)=> a.id - b.id)
  }

  

  const tbody = document.querySelector('#tabelaTarefas tbody');
  tbody.innerHTML = '';

  tarefasOrdenadas.forEach(tarefa => {
    const tr = document.createElement('tr');

    // Define os botões com base na conclusão
    let acoesHTML = '';
    if (tarefa.dataConclusao) {
      acoesHTML += `<button class="btnReabrir">Reabrir tarefa</button>`
    } else {
      acoesHTML += `
        <button class="btnConcluir">Concluir</button>
        <button class="btnExcluir">Excluir</button>
        <button class="btnEditar">Editar</button>
      `
    }

    // Define o conteúdo da linha, incluindo ações corretas
    tr.innerHTML = `
      <td>${tarefa.id}</td>
      <td>${tarefa.descricao}</td>
      <td>${tarefa.dataInicio}</td>
      <td>${tarefa.dataConclusao || ''}</td>
      <td>${acoesHTML}</td>
    `;

    // Adiciona os eventos
    const btnConcluir = tr.querySelector('.btnConcluir');
    if (btnConcluir) {
      btnConcluir.addEventListener('click', () => {
        tarefa.dataConclusao = new Date().toLocaleDateString('pt-BR')
        renderizarTabela()
      })
    }

    const btnExcluir = tr.querySelector('.btnExcluir');
    if (btnExcluir) {
      btnExcluir.addEventListener('click', () => {
        if (tarefa.dataConclusao) {
          alert('Não pode excluir tarefa que já foi concluída');
          return;
        }

        const confirmar = confirm('Tem certeza que deseja excluir essa tarefa?');
        if (confirmar) {
          tarefas = tarefas.filter(t => t.id !== tarefa.id);
          tarefasExcluidas.push(tarefa)

          renderizarTabela();
        }
      });
    }

    const btnReabrir = tr.querySelector('.btnReabrir');
    if (btnReabrir) {
      btnReabrir.addEventListener('click', () => {
        tarefa.dataConclusao = '';
        
        renderizarTabela();
      });
    }

    const btnEditar= tr.querySelector('.btnEditar')
    if(btnEditar){
      btnEditar.addEventListener('click', ()=>{
        const novaDescricao = prompt('Editar Tarefa', tarefa.descricao)
        if (novaDescricao !== null && novaDescricao !== ''){
          tarefa.descricao = novaDescricao
        }

        const novaData = prompt('Editar data(ano - mês - dia)', tarefa.dataInicio)
        if (novaData !== null && novaData !== ''){
          tarefa.dataInicio = novaData
        }

        renderizarTabela()
      })
    }

    tbody.appendChild(tr)
  });
  atualizarContadores()
}

function atualizarContadores(){
  const pendentes = tarefas.filter(t => t.dataConclusao === '').length
  const finalizadas = tarefas.filter(t => t.dataConclusao !== '').length
  const excluidas = tarefasExcluidas.length

  getById('qdtPendentes').textContent = pendentes
  getById('qdtFinalizadas').textContent = finalizadas
  getById('qdtExcluidas').textContent = excluidas
}

