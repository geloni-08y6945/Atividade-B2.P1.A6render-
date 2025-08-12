// ======================================================
// @file principal.js
// @description Script principal refatorado para usar a API do Backend.
// ======================================================

// --- Variáveis Globais de Estado ---
const Cache = {};
let garagem = {}; // Garagem local, será um espelho dos objetos interativos
let veiculoSelecionado = null; // Guarda o TIPO do veículo selecionado (ex: 'carro')
let isInitialized = false;

// --- URL da API do Backend ---
const API_BASE_URL = 'http://localhost:3000'; // Para teste local

// =========================================================================
// FUNÇÕES DE COMUNICAÇÃO COM A API
// =========================================================================

async function buscarVeiculosDaAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/veiculos`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Não foi possível carregar os veículos do servidor.');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro em buscarVeiculosDaAPI:", error);
        showNotification(error.message, "error");
        return []; // Retorna um array vazio em caso de erro para não quebrar a aplicação
    }
}

async function salvarVeiculoNaAPI(dadosDoVeiculo) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosDoVeiculo)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status} ao salvar.`);
        }
        return await response.json();
    } catch(error) {
        console.error("Erro em salvarVeiculoNaAPI:", error);
        throw error;
    }
}

// =========================================================================
// LÓGICA PRINCIPAL DA APLICAÇÃO
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    isInitialized = true;

    // Cacheia elementos do DOM
    Cache.selecaoVeiculoSection = document.getElementById('selecao-veiculo');
    Cache.detalhesVeiculoContainer = document.getElementById('detalhes-veiculo-container');
    Cache.criarVeiculoSection = document.getElementById('criar-veiculo');
    Cache.informacoesVeiculoSection = document.getElementById('informacoes-veiculo');
    Cache.acoesVeiculoSection = document.getElementById('acoes-veiculo');
    Cache.formCriarModificar = document.getElementById('formCriarModificar');
    Cache.btnCriarVeiculo = document.getElementById('btnCriarVeiculo');
    Cache.modeloInput = document.getElementById('modelo');
    Cache.corInput = document.getElementById('cor');
    Cache.nicknameInput = document.getElementById('nickname');
    
    // Cache de outros elementos que você usa...
    Cache.informacoesVeiculoDiv = document.getElementById('informacoesVeiculo');
    Cache.statusVeiculoDiv = document.getElementById('statusVeiculo');


    setupEventListeners();
    
    carregarGaragem().then(() => {
        showNotification("Garagem Inteligente Pronta!", "success", 3000);
    }).catch(err => {
        showNotification(err.message, "error");
    });
});

/**
 * Funções auxiliares para mostrar/esconder elementos
 */
function showElement(el) {
    if (el) el.style.display = 'block';
}
function hideElement(el) {
    if (el) el.style.display = 'none';
}


/**
 * Carrega os veículos da API, recria os objetos interativos e atualiza a UI.
 */
async function carregarGaragem() {
    const garagemBase = { carro: null, esportivo: null, caminhao: null, aviao: null, moto: null, bicicleta: null };
    garagem = { ...garagemBase };

    const h2 = Cache.selecaoVeiculoSection.querySelector('h2');
    Cache.selecaoVeiculoSection.innerHTML = ''; // Limpa a seção
    if (h2) Cache.selecaoVeiculoSection.appendChild(h2); // Recoloca o título

    Object.keys(garagemBase).forEach(tipo => {
        const btn = document.createElement('button');
        btn.dataset.tipo = tipo;
        btn.innerHTML = `<i class="fas fa-plus-circle"></i> Criar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
        Cache.selecaoVeiculoSection.appendChild(btn);
    });
    Cache.selecaoVeiculoSection.appendChild(document.createElement('hr'));

    const veiculosDoDB = await buscarVeiculosDaAPI();
    console.log("[Frontend] Veículos recebidos do Banco de Dados:", veiculosDoDB);

    for (const dadosVeiculo of veiculosDoDB) {
        const veiculoObj = criarInstanciaVeiculo(dadosVeiculo);
        if (veiculoObj) {
            garagem[dadosVeiculo.tipoVeiculo] = veiculoObj;
            const btnExistente = Cache.selecaoVeiculoSection.querySelector(`button[data-tipo="${dadosVeiculo.tipoVeiculo}"]`);
            if (btnExistente) {
                btnExistente.innerHTML = `<i class="fas fa-car-side"></i> ${dadosVeiculo.marca} ${dadosVeiculo.modelo}`;
                btnExistente.classList.add('veiculo-existente');
                btnExistente.title = `Selecionar ${dadosVeiculo.marca} ${dadosVeiculo.modelo}`;
            }
        }
    }
}

/**
 * Cria uma instância de uma classe de veículo a partir dos dados da API.
 */
function criarInstanciaVeiculo(dadosAPI) {
    const { tipoVeiculo, modelo, cor, nickname, _id, ano, marca } = dadosAPI;
    let veiculo = null;
    try {
        // As classes do frontend (Carro, Moto, etc.) devem ser capazes de serem instanciadas
        // com os dados básicos para que a UI funcione.
        if (tipoVeiculo === 'carro') veiculo = new Carro(modelo, cor, nickname);
        else if (tipoVeiculo === 'esportivo') veiculo = new CarroEsportivo(modelo, cor, nickname);
        else if (tipoVeiculo === 'caminhao') veiculo = new Caminhao(modelo, cor, nickname, 1000);
        else if (tipoVeiculo === 'aviao') veiculo = new Aviao(modelo, cor, nickname, 30);
        else if (tipoVeiculo === 'moto') veiculo = new Moto(modelo, cor, nickname);
        else if (tipoVeiculo === 'bicicleta') veiculo = new Bicicleta(modelo, cor, nickname, 'urbana');

        if (veiculo) {
            veiculo.id_api = _id;
            veiculo.ano = ano;
            veiculo.marca = marca;
            veiculo.placa = dadosAPI.placa;
        }
        return veiculo;
    } catch(e) {
        console.error(`Erro ao criar instância para ${tipoVeiculo}:`, e);
        return null;
    }
}

/**
 * Configura todos os event listeners da página.
 */
function setupEventListeners() {
    Cache.selecaoVeiculoSection?.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-tipo]');
        if (button) {
            const tipo = button.dataset.tipo;
            veiculoSelecionado = tipo; // Define o tipo selecionado
            updateUIForSelectedVehicle(); // Atualiza a UI
        }
    });
    
    Cache.btnCriarVeiculo?.addEventListener("click", handleCreateModifyVehicle);
    
    // Adicione outros listeners aqui, como para ações (ligar, acelerar), etc.
    // Cache.acoesVeiculoSection?.addEventListener("click", handleVehicleAction);
}

/**
 * Atualiza a interface do usuário com base no tipo de veículo selecionado.
 */
function updateUIForSelectedVehicle() {
    if (!veiculoSelecionado) {
        hideElement(Cache.detalhesVeiculoContainer);
        return;
    }
    
    showElement(Cache.detalhesVeiculoContainer); // Mostra o container geral
    const veiculo = garagem[veiculoSelecionado];

    if (veiculo) {
        // Se já EXISTE um veículo desse tipo, mostra seus detalhes.
        hideElement(Cache.criarVeiculoSection);
        showElement(Cache.informacoesVeiculoSection);
        showElement(Cache.acoesVeiculoSection);
        displayVehicleInfo(veiculo); // Função para preencher os detalhes
    } else {
        // Se NÃO EXISTE, mostra o formulário de criação.
        hideElement(Cache.informacoesVeiculoSection);
        hideElement(Cache.acoesVeiculoSection);
        showElement(Cache.criarVeiculoSection);
        Cache.formCriarModificar.reset(); // Limpa o formulário
    }
}

/**
 * Mostra as informações de um veículo existente na tela.
 */
function displayVehicleInfo(veiculo) {
    if(!veiculo || !Cache.informacoesVeiculoDiv) return;
    
    Cache.informacoesVeiculoDiv.innerHTML = `
        <strong>Placa:</strong> ${veiculo.placa || 'N/A'}<br>
        <strong>Marca:</strong> ${veiculo.marca || 'N/A'}<br>
        <strong>Modelo:</strong> ${veiculo.modelo}<br>
        <strong>Ano:</strong> ${veiculo.ano || 'N/A'}<br>
        <strong>Cor:</strong> ${veiculo.cor}
    `;
    
    const status = veiculo.ligado ? "Ligado" : "Desligado";
    const statusClass = veiculo.ligado ? "status-ligado" : "status-desligado";
    Cache.statusVeiculoDiv.textContent = status;
    Cache.statusVeiculoDiv.className = `status-veiculo ${statusClass}`;
    
    // Atualize outros elementos da UI aqui (velocidade, combustível, etc.)
}

/**
 * Lida com o clique no botão "Criar Veículo" do formulário.
 */
async function handleCreateModifyVehicle() {
    if (!veiculoSelecionado) return;

    // Coleta dos dados do formulário
    const placa = document.getElementById('placa')?.value.trim().toUpperCase();
    const marca = document.getElementById('marca')?.value.trim();
    const modelo = Cache.modeloInput?.value.trim();
    const ano = document.getElementById('ano')?.value;
    const cor = Cache.corInput?.value.trim();
    const nickname = Cache.nicknameInput?.value.trim() || null;
    
    if (!placa || !marca || !modelo || !ano || !cor) {
        showNotification("Placa, Marca, Modelo, Ano e Cor são obrigatórios!", 'error');
        return;
    }

    const dadosParaAPI = {
        placa, marca, modelo, ano: parseInt(ano), cor, nickname,
        tipoVeiculo: veiculoSelecionado
    };

    try {
        showNotification("Salvando no banco de dados...", "info");
        const veiculoSalvo = await salvarVeiculoNaAPI(dadosParaAPI);
        showNotification(`Veículo ${veiculoSalvo.placa} criado com sucesso!`, 'success');

        await carregarGaragem(); // Recarrega a garagem para atualizar o botão
        
        // Após criar, seleciona o veículo recém-criado para ver os detalhes
        updateUIForSelectedVehicle(); 
        
    } catch (error) {
        showNotification(`${error.message}`, 'error', 5000);
    }
}


// Função para exibir notificações (mantenha a sua ou use esta)
function showNotification(message, type = 'info', duration = 4000) {
    const area = document.getElementById('notification-area');
    if (!area) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    area.appendChild(notification);

    // Força a animação de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove a notificação após a duração
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 500); // tempo para a animação de saída
    }, duration);
}

// ... Cole aqui o restante de suas funções (ações do veículo, música, manutenção, etc.)