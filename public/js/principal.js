document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = window.location.origin;

    let garagem = [];
    let veiculoSelecionado = null;

    function showNotification(message, type = 'info', duration = 3000) {
        const area = document.getElementById('notification-area');
        if (!area) return;
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        area.appendChild(notification);
        setTimeout(() => notification.remove(), duration);
    }

    const Cache = {
        garagemContainer: document.getElementById('garagem-container'),
        garagemLoader: document.getElementById('garagem-loader'),
        mainContentContainer: document.getElementById('main-content-container'),
        placeholderDetalhes: document.getElementById('placeholder-detalhes'),
        btnMostrarForm: document.getElementById('btn-mostrar-form-criar'),
        criarVeiculoSection: document.getElementById('criar-veiculo-section'),
        formCriar: document.getElementById('form-criar-veiculo'),
        btnCancelar: document.getElementById('btn-cancelar'),
        tipoVeiculoSelect: document.getElementById('tipoVeiculo'),
        turboGroup: document.getElementById('turbo-group'),
        capacidadeGroup: document.getElementById('capacidade-group'),
        infoSection: document.getElementById('info-veiculo-section'),
        infoVeiculoTitulo: document.getElementById('info-veiculo-titulo'),
        btnRemoverVeiculo: document.getElementById('btn-remover-veiculo'),
        infoDisplay: document.getElementById('info-display'),
        statusVeiculo: document.getElementById('status-veiculo'),
        velocidadeValor: document.getElementById('velocidade-valor'),
        progressoVelocidade: document.getElementById('progresso-velocidade'),
        fuelDisplay: document.getElementById('fuel-display'),
        fuelValor: document.getElementById('fuel-valor'),
        fuelBar: document.getElementById('fuel-bar'),
        cargaDisplay: document.getElementById('carga-display'),
        cargaValor: document.getElementById('carga-valor'),
        turboDisplay: document.getElementById('turbo-display'),
        turboStatus: document.getElementById('turbo-status'),
        acoesVeiculo: document.getElementById('acoes-veiculo'),
        cidadeInput: document.getElementById('cidade-input'),
        verClimaBtn: document.getElementById('ver-clima-btn'),
        climaResultado: document.getElementById('clima-resultado'),
        // --- INÍCIO DA MODIFICAÇÃO ---
        secaoManutencao: document.getElementById('secao-manutencao'),
        listaManutencoes: document.getElementById('lista-manutencoes'),
        manutencaoLoader: document.getElementById('manutencao-loader'),
        formAddManutencao: document.getElementById('form-add-manutencao'),
        // --- FIM DA MODIFICAÇÃO ---
    };

    async function apiFetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro de Servidor: ${response.status}`);
            }
            return response.status === 204 || response.headers.get("content-length") === "0" ? null : response.json();
        } catch (error) {
            showNotification(error.message, 'error');
            throw error;
        }
    }

    async function carregarGaragem() {
        showLoader(Cache.garagemLoader);
        try {
            const veiculosDoDB = await apiFetch('/api/veiculos');
            garagem = veiculosDoDB && Array.isArray(veiculosDoDB) ? veiculosDoDB.map(criarInstanciaVeiculo).filter(Boolean) : [];
            renderizarGaragem();
        } catch (error) {
            Cache.garagemContainer.innerHTML = "<p>Falha ao carregar a garagem.</p>";
        } finally {
            hideLoader(Cache.garagemLoader);
        }
    }

    function renderizarGaragem() {
        Cache.garagemContainer.innerHTML = '';
        if (garagem.length === 0) {
            Cache.garagemContainer.innerHTML = '<p>A garagem está vazia.</p>';
        } else {
            garagem.forEach(veiculo => {
                const btn = document.createElement('button');
                btn.className = 'garagem-btn';
                btn.dataset.id = veiculo.id_api;
                btn.innerHTML = `<strong>${veiculo.marca} ${veiculo.modelo}</strong><small>${veiculo.placa}</small>`;
                Cache.garagemContainer.appendChild(btn);
            });
        }
    }
    
    function criarInstanciaVeiculo(dadosAPI) {
        const { tipoVeiculo, modelo, cor, _id, ano, marca, placa, turbo, capacidadeCarga } = dadosAPI;
        if (!tipoVeiculo) { console.error("Dados inválidos:", dadosAPI); return null; }
        
        const classe = capitalizar(tipoVeiculo === 'esportivo' ? 'Esportivo' : tipoVeiculo);
        if (window[classe]) {
            let veiculo;
            if (classe === 'Esportivo') {
                veiculo = new window.Esportivo(modelo, cor, null, turbo, showNotification);
            } else if (classe === 'Caminhao') {
                veiculo = new window.Caminhao(modelo, cor, null, capacidadeCarga, showNotification);
            } else {
                veiculo = new window[classe](modelo, cor, null, showNotification);
            }
            Object.assign(veiculo, { id_api: _id, ano, marca, placa });
            return veiculo;
        }
        console.error(`Classe de veículo "${classe}" não encontrada.`);
        return null;
    }
    
    function handleSelecaoGaragem(e) {
        const btn = e.target.closest('.garagem-btn');
        if (!btn) return;
        const veiculoId = btn.dataset.id;
        veiculoSelecionado = garagem.find(v => v.id_api === veiculoId);
        if (veiculoSelecionado) {
            document.querySelectorAll('.garagem-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mostrarDetalhesVeiculo(veiculoSelecionado);
        }
    }
    
    function atualizarDisplayVeiculo(veiculo) {
        Cache.infoVeiculoTitulo.textContent = `${veiculo.marca} ${veiculo.modelo}`;
        Cache.infoDisplay.innerHTML = `<strong>Placa:</strong> ${veiculo.placa} | <strong>Ano:</strong> ${veiculo.ano}`;
        Cache.statusVeiculo.textContent = veiculo.ligado ? 'Ligado' : 'Desligado';
        Cache.statusVeiculo.className = `status-veiculo ${veiculo.ligado ? 'status-ligado' : 'status-desligado'}`;
        Cache.velocidadeValor.textContent = veiculo.velocidade;
        Cache.progressoVelocidade.style.width = `${(veiculo.velocidade / 220) * 100}%`;
        
        veiculo.fuelLevel !== undefined ? Cache.fuelDisplay.classList.remove('hidden') : Cache.fuelDisplay.classList.add('hidden');
        if (veiculo.fuelLevel !== undefined) { Cache.fuelValor.textContent = veiculo.fuelLevel; Cache.fuelBar.style.width = `${veiculo.fuelLevel}%`; }
        
        veiculo instanceof Caminhao ? Cache.cargaDisplay.classList.remove('hidden') : Cache.cargaDisplay.classList.add('hidden');
        if(veiculo instanceof Caminhao) Cache.cargaValor.textContent = `${veiculo.cargaAtual}/${veiculo.capacidadeCarga}`;

        veiculo instanceof Esportivo ? Cache.turboDisplay.classList.remove('hidden') : Cache.turboDisplay.classList.add('hidden');
        if(veiculo instanceof Esportivo) Cache.turboStatus.textContent = veiculo.turboAtivo ? 'Ativado' : 'Desativado';

        renderizarBotoesAcao(veiculo);
    }
    
    function renderizarBotoesAcao(veiculo) {
        Cache.acoesVeiculo.innerHTML = '';
        const acoes = [ { nome: 'ligar', icone: 'fa-power-off' }, { nome: 'desligar', icone: 'fa-power-off' }, { nome: 'acelerar', icone: 'fa-gauge-high' }, { nome: 'frear', icone: 'fa-brake-warning' }, { nome: 'buzinar', icone: 'fa-bullhorn' } ];
        
        if (veiculo instanceof window.Esportivo) acoes.push({ nome: 'ativarTurbo', icone: 'fa-bolt', label: 'Turbo' });
        if (veiculo instanceof window.Caminhao) {
            acoes.push({ nome: 'carregar', icone: 'fa-plus', label: 'Carregar' });
            acoes.push({ nome: 'descarregar', icone: 'fa-minus', label: 'Descarregar' });
        }
        
        acoes.forEach(acaoInfo => {
            if (typeof veiculo[acaoInfo.nome] === 'function') {
                const btn = document.createElement('button');
                btn.innerHTML = `<i class="fas ${acaoInfo.icone}"></i> ${acaoInfo.label || capitalizar(acaoInfo.nome)}`;
                btn.dataset.acao = acaoInfo.nome;
                Cache.acoesVeiculo.appendChild(btn);
            }
        });
    }

    function handleAcaoVeiculo(e) {
        const btn = e.target.closest('button[data-acao]');
        if (!btn || !veiculoSelecionado) return;
        const acao = btn.dataset.acao;
        if (typeof veiculoSelecionado[acao] === 'function') {
            if (acao === 'carregar' || acao === 'descarregar') {
                const valor = prompt(`Quanto de carga deseja ${acao}?`);
                if(valor && !isNaN(valor)) veiculoSelecionado[acao](parseInt(valor));
            } else {
                veiculoSelecionado[acao]();
            }
            atualizarDisplayVeiculo(veiculoSelecionado);
        }
    }

    async function handleSalvarVeiculo(e) {
        e.preventDefault();
        const formData = new FormData(Cache.formCriar);
        const dadosForm = Object.fromEntries(formData.entries());
        dadosForm.turbo = Cache.formCriar.querySelector('#turbo').checked;
        if (!dadosForm.tipoVeiculo) { showNotification('Selecione um tipo de veículo.', 'error'); return; }
        try {
            await apiFetch('/api/veiculos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosForm) });
            showNotification('Veículo adicionado!', 'success');
            resetarPainelDireito();
            await carregarGaragem();
        } catch (error) {}
    }
    
    async function handleRemoverVeiculo() {
        if (!veiculoSelecionado) return;
        if (confirm(`Remover o ${veiculoSelecionado.marca} ${veiculoSelecionado.modelo}?`)) {
            try {
                await apiFetch(`/api/veiculos/${veiculoSelecionado.id_api}`, { method: 'DELETE' });
                showNotification('Veículo removido!', 'success');
                resetarPainelDireito();
                await carregarGaragem();
            } catch (error) {}
        }
    }
    
    // --- INÍCIO DA MODIFICAÇÃO ---
    async function carregarManutencoes(veiculoId) {
        showLoader(Cache.manutencaoLoader);
        Cache.listaManutencoes.innerHTML = '';
        try {
            const manutencoes = await apiFetch(`/api/veiculos/${veiculoId}/manutencoes`);
            if (manutencoes.length === 0) {
                Cache.listaManutencoes.innerHTML = '<li>Nenhuma manutenção registrada.</li>';
            } else {
                manutencoes.forEach(m => {
                    const item = document.createElement('li');
                    item.className = 'item-manutencao';
                    const dataFormatada = new Date(m.data).toLocaleDateString('pt-BR');
                    const custoFormatado = m.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    item.innerHTML = `<p>${m.descricaoServico}</p><small>${dataFormatada} | ${custoFormatado} | KM: ${m.quilometragem || 'N/A'}</small>`;
                    Cache.listaManutencoes.appendChild(item);
                });
            }
        } catch (error) {
            Cache.listaManutencoes.innerHTML = '<li>Erro ao carregar manutenções.</li>';
        } finally {
            hideLoader(Cache.manutencaoLoader);
        }
    }

    async function handleAdicionarManutencao(e) {
        e.preventDefault();
        if (!veiculoSelecionado) return;
        
        const formData = new FormData(Cache.formAddManutencao);
        const dadosForm = Object.fromEntries(formData.entries());

        try {
            await apiFetch(`/api/veiculos/${veiculoSelecionado.id_api}/manutencoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosForm)
            });
            showNotification('Manutenção adicionada!', 'success');
            Cache.formAddManutencao.reset();
            await carregarManutencoes(veiculoSelecionado.id_api);
        } catch (error) {}
    }
    // --- FIM DA MODIFICAÇÃO ---

    async function carregarClima(cidade = 'sao paulo') {
        Cache.climaResultado.innerHTML = `<div class="loader"></div>`;
        try {
            const data = await apiFetch(`/api/previsao/${cidade}`);
            const previsoesPorDia = {};
            data.list.forEach(item => {
                const dia = new Date(item.dt * 1000).toISOString().split('T')[0];
                if (!previsoesPorDia[dia] && Object.keys(previsoesPorDia).length < 5) {
                    previsoesPorDia[dia] = { temps: [], icones: [], dataObj: new Date(dia + 'T12:00:00') };
                }
                if (previsoesPorDia[dia]) {
                    previsoesPorDia[dia].temps.push(item.main.temp);
                    previsoesPorDia[dia].icones.push(item.weather[0].icon);
                }
            });

            Cache.climaResultado.innerHTML = '';
            Object.values(previsoesPorDia).forEach(diaData => {
                const temp_max = Math.max(...diaData.temps);
                const temp_min = Math.min(...diaData.temps);
                const icone = diaData.icones[Math.floor(diaData.icones.length / 2)];
                
                const card = document.createElement('div');
                card.className = 'clima-card';
                card.innerHTML = `<strong>${diaData.dataObj.toLocaleDateString('pt-BR', { weekday: 'short' })}</strong><img src="https://openweathermap.org/img/wn/${icone}.png"><p>${Math.round(temp_max)}°/${Math.round(temp_min)}°</p>`;
                Cache.climaResultado.appendChild(card);
            });
        } catch (e) {
            Cache.climaResultado.innerHTML = `<p>Cidade não encontrada.</p>`;
        }
    }

    function mostrarDetalhesVeiculo(veiculo) {
        Cache.placeholderDetalhes.classList.add('hidden');
        Cache.mainContentContainer.classList.remove('hidden');
        Cache.infoSection.classList.remove('hidden');
        Cache.criarVeiculoSection.classList.add('hidden');
        atualizarDisplayVeiculo(veiculo);
        // --- INÍCIO DA MODIFICAÇÃO ---
        Cache.secaoManutencao.classList.remove('hidden');
        carregarManutencoes(veiculo.id_api);
        // --- FIM DA MODIFICAÇÃO ---
    }

    function mostrarFormularioCriacao() {
        veiculoSelecionado = null;
        document.querySelectorAll('.garagem-btn').forEach(b => b.classList.remove('active'));
        Cache.placeholderDetalhes.classList.add('hidden');
        Cache.mainContentContainer.classList.remove('hidden');
        Cache.criarVeiculoSection.classList.remove('hidden');
        Cache.infoSection.classList.add('hidden');
        Cache.formCriar.reset();
        atualizarCamposFormulario();
        // --- INÍCIO DA MODIFICAÇÃO ---
        Cache.secaoManutencao.classList.add('hidden');
        // --- FIM DA MODIFICAÇÃO ---
    }

    function resetarPainelDireito() {
        veiculoSelecionado = null;
        document.querySelectorAll('.garagem-btn').forEach(b => b.classList.remove('active'));
        Cache.mainContentContainer.classList.add('hidden');
        Cache.placeholderDetalhes.classList.remove('hidden');
        // --- INÍCIO DA MODIFICAÇÃO ---
        Cache.secaoManutencao.classList.add('hidden');
        // --- FIM DA MODIFICAÇÃO ---
    }

    function capitalizar(texto) { return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : ''; }
    function showLoader(loader) { loader.classList.remove('hidden'); }
    function hideLoader(loader) { loader.classList.add('hidden'); }
    function atualizarCamposFormulario() {
        const tipo = Cache.tipoVeiculoSelect.value;
        Cache.turboGroup.style.display = tipo === 'esportivo' ? 'flex' : 'none';
        Cache.capacidadeGroup.style.display = tipo === 'caminhao' ? 'block' : 'none';
    }

    function init() {
        Cache.garagemContainer.addEventListener('click', handleSelecaoGaragem);
        Cache.btnMostrarForm.addEventListener('click', mostrarFormularioCriacao);
        Cache.formCriar.addEventListener('submit', handleSalvarVeiculo);
        Cache.btnCancelar.addEventListener('click', resetarPainelDireito);
        Cache.tipoVeiculoSelect.addEventListener('change', atualizarCamposFormulario);
        Cache.acoesVeiculo.addEventListener('click', handleAcaoVeiculo);
        Cache.btnRemoverVeiculo.addEventListener('click', handleRemoverVeiculo);
        Cache.verClimaBtn.addEventListener('click', () => carregarClima(Cache.cidadeInput.value || 'sao paulo'));
        Cache.cidadeInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') carregarClima(Cache.cidadeInput.value || 'sao paulo'); });
        
        // --- INÍCIO DA MODIFICAÇÃO ---
        Cache.formAddManutencao.addEventListener('submit', handleAdicionarManutencao);
        // --- FIM DA MODIFICAÇÃO ---

        carregarGaragem();
        carregarClima();
    }

    init();
});