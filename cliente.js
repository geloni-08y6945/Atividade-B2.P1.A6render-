// Cole este código no final do seu arquivo client.js

// Lembre-se que você já deve ter a URL do seu backend definida no topo do arquivo.
// Ex: const backendUrl = 'http://localhost:3001'; 
// ou const backendUrl = 'https://seu-backend.onrender.com';

// --- INÍCIO DO NOVO CÓDIGO PARA DICAS ---

// 1. Pegar os novos elementos do HTML que acabamos de criar
const btnBuscarDicas = document.getElementById('btn-buscar-dicas');
const dicasContainer = document.getElementById('dicas-container');

// 2. Criar a função que busca os dados no backend
async function buscarDicasDeManutencao() {
    dicasContainer.innerHTML = '<p>Carregando dicas...</p>'; // Mostra uma mensagem de carregando

    try {
        // Faz a chamada para o NOVO endpoint que você criou no backend
        const response = await fetch(`${backendUrl}/api/dicas-manutencao`);

        if (!response.ok) {
            // Se o backend retornar um erro, nós mostramos aqui
            throw new Error(`Erro na rede: ${response.statusText}`);
        }

        const dicas = await response.json(); // Converte a resposta para JSON
        
        exibirDicasNaTela(dicas); // Chama a função para mostrar os dados

    } catch (error) {
        console.error('Erro ao buscar dicas de manutenção:', error);
        dicasContainer.innerHTML = '<p>Falha ao carregar as dicas. Tente novamente.</p>';
    }
}

// 3. Criar a função que exibe os dados na tela
function exibirDicasNaTela(listaDeDicas) {
    dicasContainer.innerHTML = ''; // Limpa a mensagem de "Carregando..."

    if (listaDeDicas.length === 0) {
        dicasContainer.innerHTML = '<p>Nenhuma dica encontrada.</p>';
        return;
    }

    // Cria uma lista não ordenada (<ul>) para as dicas
    const ul = document.createElement('ul');

    // Para cada item na lista de dicas, cria um item de lista (<li>)
    listaDeDicas.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.dica; // O texto do <li> será a dica
        ul.appendChild(li); // Adiciona o <li> na <ul>
    });

    dicasContainer.appendChild(ul); // Adiciona a lista completa na nossa div
}

// 4. Adicionar o "ouvinte de evento" no botão
// Isso faz com que a função buscarDicasDeManutencao() seja executada quando o botão for clicado
btnBuscarDicas.addEventListener('click', buscarDicasDeManutencao);

// --- FIM DO NOVO CÓDIGO PARA DICAS ---