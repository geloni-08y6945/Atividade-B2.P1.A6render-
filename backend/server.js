// server.js (Versão Corrigida e Completa)

// Importações dos módulos necessários
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Carrega variáveis de ambiente do arquivo .env para process.env
dotenv.config();

// --- CORREÇÃO PARA __filename e __dirname com ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializa o aplicativo Express
const app = express();
const port = process.env.PORT || 3001;
let apiKey = process.env.OPENWEATHER_API_KEY;

apiKey = "10c66186c8ecac1959205ad3b6a2032c";

// ==================================================================
//          DADOS SIMULADOS (NOSSO "BANCO DE DADOS" EM MEMÓRIA)
// ==================================================================

const dicasManutencaoGerais = [
    { id: 1, dica: "Verifique o nível do óleo do motor regularmente." },
    { id: 2, dica: "Mantenha os pneus calibrados com a pressão correta." },
    { id: 3, dica: "Confira o nível do fluido de arrefecimento (radiador)." }
];

const dicasPorTipo = {
    carro: [
        { id: 10, dica: "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
        { id: 11, dica: "Verifique o alinhamento e balanceamento pelo menos uma vez por ano." }
    ],
    moto: [
        { id: 20, dica: "Lubrifique e verifique a tensão da corrente a cada 500 km." },
        { id: 21, dica: "Verifique o estado e a pressão dos pneus antes de cada viagem." }
    ]
};

// --- NOVO CONJUNTO DE DADOS ADICIONADO ---
const veiculosDestaque = [
    { 
        id: 1, 
        modelo: "Ford Maverick Híbrido", 
        ano: 2024, 
        destaque: "Combinação perfeita de economia e potência.", 
        imagemUrl: "https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/maverick/2023/colorizer/preto-asteca/mav-preto-asteca.png"
    },
    { 
        id: 2, 
        modelo: "VW ID.Buzz (Kombi Elétrica)", 
        ano: 2025, 
        destaque: "O design clássico da Kombi com a tecnologia do futuro.", 
        imagemUrl: "https://production.autoforce.com/uploads/version/profile_image/8733/main_comprar-cargo-1-5-ton-2023_6186b4f74d.png"
    }
];

// ==================================================================
//                            MIDDLEWARE
// ==================================================================
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ==================================================================
//                         ENDPOINTS DA API
// ==================================================================

// ENDPOINT 1: Previsão do Tempo (Já existente)
app.get('/api/previsao/:cidade', async (req, res) => {
    // ... seu código para previsão do tempo continua o mesmo ...
    const { cidade } = req.params;
    if (!apiKey) {
        console.error('[Servidor] Chave da API OpenWeatherMap não configurada.');
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor] Dados recebidos da OpenWeatherMap.');
        res.json(apiResponse.data);
    } catch (error) {
        console.error("[Servidor] Erro ao buscar previsão:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo no servidor.';
        res.status(status).json({ error: message });
    }
});

// ENDPOINT 2: Dicas de manutenção gerais
app.get('/api/dicas-manutencao', (req, res) => {
    console.log("Recebida requisição para /api/dicas-manutencao");
    res.json(dicasManutencaoGerais);
});

// ENDPOINT 3: Dicas específicas por tipo de veículo
app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    const { tipoVeiculo } = req.params;
    console.log(`Recebida requisição para dicas do tipo: ${tipoVeiculo}`);
    const dicas = dicasPorTipo[tipoVeiculo.toLowerCase()];
    if (dicas) {
        res.json(dicas);
    } else {
        res.status(404).json({ error: `Nenhuma dica encontrada para o tipo: ${tipoVeiculo}` });
    }
});

// --- NOVO ENDPOINT ADICIONADO ---
// ENDPOINT 4: Lista de veículos em destaque
app.get('/api/garagem/veiculos-destaque', (req, res) => {
    console.log("Recebida requisição para /api/garagem/veiculos-destaque");
    res.json(veiculosDestaque);
});

// ==================================================================
//                          INICIA O SERVIDOR
// ==================================================================
app.listen(port, () => {
    console.log(`Servidor backend rodando na porta ${port}`);
});