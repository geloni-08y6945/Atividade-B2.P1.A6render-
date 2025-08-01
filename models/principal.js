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
// 👇👇👇 LEMBRE-SE DE COLOCAR A URL PÚBLICA DO SEU BACKEND AQUI QUANDO FOR FAZER O DEPLOY 👇👇👇
const API_BASE_URL = 'http://localhost:3000'; // Para teste local

// =========================================================================
// FUNÇÕES DE COMUNICAÇÃO COM A API (A PONTE PARA O BACKEND)
// =========================================================================

/**
 * Busca a lista completa de veículos salvos no banco de dados.
 * @returns {Promise<Array>} Uma lista de objetos com os dados dos veículos.
 */
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
        throw error; // Re-lança o erro para ser tratado por quem chamou
    }
}

/**
 * Envia os dados de um novo veículo para serem salvos no banco de dados.
 * @param {object} dadosDoVeiculo - Um objeto simples com os dados (placa, modelo, etc.).
 * @returns {Promise<object>} O objeto do veículo salvo, retornado pela API.
 */
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

// ... Suas funções de API de Previsão do Tempo podem ser mantidas aqui ...

// =========================================================================
// LÓGICA PRINCIPAL DA APLICAÇÃO
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    isInitialized = true;

    // Cacheia todos os elementos do DOM para acesso rápido
    // (Omitido para economizar espaço, mantenha seu código de cache aqui)
    Cache.selecaoVeiculoSection = document.getElementById('selecao-veiculo');
    // ...e todos os outros...

    setupEventListeners();
    
    // Inicia a aplicação carregando os dados da garagem a partir da API
    carregarGaragem().then(() => {
        updateUIForSelectedVehicle(); // Atualiza a UI com base no estado inicial
        showNotification("Garagem Inteligente Pronta!", "success", 2000);
    }).catch(err => {
        showNotification(err.message, "error");
    });
});

/**
 * Carrega os veículos da API, recria os objetos interativos e atualiza a UI.
 */
async function carregarGaragem() {
    const garagemBase = { carro: null, esportivo: null, caminhao: null, aviao: null, moto: null, bicicleta: null };
    garagem = { ...garagemBase }; // Reseta a garagem local

    // Limpa a UI de seleção de veículos antes de recriar
    if(Cache.selecaoVeiculoSection){
        Cache.selecaoVeiculoSection.innerHTML = '<h2><i class="fas fa-warehouse"></i> Minha Garagem</h2>';
        // Adiciona os botões de tipo para CRIAR novos veículos
        Object.keys(garagemBase).forEach(tipo => {
            const btn = document.createElement('button');
            btn.dataset.tipo = tipo;
            btn.innerHTML = `<i class="fas fa-plus-circle"></i> Criar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
            Cache.selecaoVeiculoSection.appendChild(btn);
        });
        Cache.selecaoVeiculoSection.innerHTML += '<hr>'; // Divisor visual
    }

    const veiculosDoDB = await buscarVeiculosDaAPI();
    console.log("[Frontend] Veículos recebidos do Banco de Dados:", veiculosDoDB);

    for (const dadosVeiculo of veiculosDoDB) {
        // Para cada veículo do banco, criamos o objeto interativo do frontend
        const veiculoObj = criarInstanciaVeiculo(dadosVeiculo);
        if (veiculoObj) {
            garagem[dadosVeiculo.tipoVeiculo] = veiculoObj;

            // Atualiza o botão para refletir o veículo existente
            const btnExistente = Cache.selecaoVeiculoSection.querySelector(`button[data-tipo="${dadosVeiculo.tipoVeiculo}"]`);
            if (btnExistente) {
                btnExistente.innerHTML = `<i class="fas fa-car-side"></i> ${dadosVeiculo.marca} ${dadosVeiculo.modelo} (${dadosVeiculo.placa})`;
                btnExistente.classList.add('veiculo-existente'); // Adiciona uma classe para estilização
                btnExistente.title = `Selecionar ${dadosVeiculo.marca} ${dadosVeiculo.modelo}`;
            }
        }
    }
}

/**
 * Função auxiliar que transforma dados puros da API em objetos de classe interativos.
 */
function criarInstanciaVeiculo(dadosAPI) {
    const { tipoVeiculo, modelo, cor, nickname, imagem, _id, ano } = dadosAPI;
    let veiculo = null;
    try {
        // Usa as suas classes do frontend para criar os "carros do jogo"
        if (tipoVeiculo === 'carro') veiculo = new Carro(modelo, cor, nickname, imagem);
        else if (tipoVeiculo === 'esportivo') veiculo = new CarroEsportivo(modelo, cor, nickname, imagem);
        else if (tipoVeiculo === 'caminhao') veiculo = new Caminhao(modelo, cor, nickname, 1000, imagem);
        else if (tipoVeiculo === 'aviao') veiculo = new Aviao(modelo, cor, nickname, 30, imagem);
        else if (tipoVeiculo === 'moto') veiculo = new Moto(modelo, cor, nickname, imagem);
        else if (tipoVeiculo === 'bicicleta') veiculo = new Bicicleta(modelo, cor, nickname, 'urbana', imagem);

        if (veiculo) {
            veiculo.id_api = _id; // Armazena o ID único do MongoDB no objeto!
            veiculo.ano = ano; // Armazena o ano
        }
        return veiculo;
    } catch(e) {
        console.error(`Erro ao criar instância para ${tipoVeiculo}:`, e);
        return null;
    }
}

/**
 * Lida com o clique no botão "Criar Veículo" do formulário.
 */
async function handleCreateModifyVehicle() {
    if (!veiculoSelecionado) return;

    // Coleta dos dados do formulário
    const placa = document.getElementById('placa')?.value.trim();
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

        // Recarrega a garagem inteira do banco de dados para atualizar a UI.
        await carregarGaragem();
        veiculoSelecionado = null;
        updateUIForSelectedVehicle();
        hideElement(Cache.criarVeiculoSection);

    } catch (error) {
        showNotification(`Erro ao criar veículo: ${error.message}`, 'error', 5000);
    }
}

function setupEventListeners() {
    Cache.selecaoVeiculoSection?.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-tipo]');
        if (button) {
            const tipo = button.dataset.tipo;
            veiculoSelecionado = tipo;
            updateUIForSelectedVehicle();
        }
    });
    
    // A função de modificar (UPDATE) será implementada na próxima atividade.
    // Por enquanto, o formulário serve apenas para criar.
    Cache.btnCriarVeiculo?.addEventListener("click", handleCreateModifyVehicle);
    
    // Seus outros event listeners para ações (ligar, acelerar, etc.) podem ser mantidos.
    Cache.acoesVeiculoSection?.addEventListener("click", handleVehicleAction);
    // ... e os outros ...
}

function updateUIForSelectedVehicle() {
    if (!veiculoSelecionado) {
        hideElement(Cache.detalhesVeiculoContainer);
        return;
    }
    
    showElement(Cache.detalhesVeiculoContainer);
    const veiculo = garagem[veiculoSelecionado];

    if (veiculo) {
        // Se já existe um veículo desse tipo, mostra seus detalhes.
        showVehicleDetailsView(veiculo);
    } else {
        // Se não existe, mostra o formulário de criação.
        showVehicleCreationView();
    }
}

// Suas funções de UI como showVehicleDetailsView, showVehicleCreationView,
// updateDisplayContent, etc., podem ser mantidas como estão, pois elas
// operam em cima da variável 'garagem', que agora é populada pela API.

// A função 'salvarGaragem' que usava localStorage se torna obsoleta para persistência.
// As ações como ligar, acelerar, etc., ainda podem chamar uma versão dela para
// salvar o ESTADO ATUAL (velocidade, combustível), mas isso seria para a próxima atividade (UPDATE).
function salvarGaragem() {
    console.log("A persistência agora é feita via API. Esta função pode ser usada para salvar estados voláteis no futuro.");
    // Na próxima atividade, esta função fará uma chamada PUT/PATCH para a API.
}

// ... Cole o resto das suas funções de UI e manipuladores de eventos aqui ...
// (handleVehicleAction, showNotification, etc.)