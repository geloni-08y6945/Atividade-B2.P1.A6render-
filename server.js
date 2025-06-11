// GaragemInteligente/backend/server.js

// Importações dos módulos necessários
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;

// ----------------------------------------------------------------------------------
// >> PARTE CRÍTICA: Middleware para habilitar o CORS <<
// Este bloco deve vir ANTES de todas as suas rotas (app.get).
// Ele adiciona os cabeçalhos de permissão em TODAS as respostas do servidor.
// ----------------------------------------------------------------------------------
app.use((req, res, next) => {
    // Permite que qualquer origem (qualquer site) acesse sua API. O '*' significa 'todos'.
    res.header('Access-Control-Allow-Origin', '*');
    // Define quais cabeçalhos são permitidos na requisição.
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // Continua para a próxima etapa (a rota do endpoint).
    next();
});

// ----- DADOS SIMULADOS PARA NOVOS ENDPOINTS (da atividade) -----
const dicasManutencaoGerais = [
    { id: 1, dica: "Verifique o nível do óleo regularmente." },
    { id: 2, dica: "Calibre os pneus semanalmente." },
    { id: 3, dica: "Confira o fluido de arrefecimento." }
];
const dicasPorTipo = {
    carro: [
        { id: 10, dica: "Faça o rodízio dos pneus a cada 10.000 km." },
        { id: 11, dica: "Verifique o alinhamento e balanceamento anualmente." }
    ],
    moto: [
        { id: 20, dica: "Lubrifique a corrente frequentemente." },
        { id: 21, dica: "Verifique a tensão da corrente." }
    ]
};

// ----- ENDPOINTS DA API -----

// Endpoint de Previsão do Tempo
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;

    if (!apiKey) {
        console.error('[Servidor] ERRO: Chave da API OpenWeatherMap não configurada.');
        return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        res.json(apiResponse.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão no servidor.';
        res.status(status).json({ error: message });
    }
});

// Endpoint de Dicas Gerais
app.get('/api/dicas-manutencao', (req, res) => {
    console.log("Recebida requisição para /api/dicas-manutencao");
    res.json(dicasManutencaoGerais);
});

// Endpoint de Dicas por Tipo de Veículo
app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    const { tipoVeiculo } = req.params;
    const dicas = dicasPorTipo[tipoVeiculo.toLowerCase()];

    if (dicas) {
        res.json(dicas);
    } else {
        res.status(404).json({ error: `Nenhuma dica encontrada para o tipo: ${tipoVeiculo}` });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando na porta ${port}`);
});