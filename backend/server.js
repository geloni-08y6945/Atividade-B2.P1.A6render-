// GaragemInteligente/backend/server.js
import express from 'express';
import dotenv from 'dotenv'; 
import axios from 'axios';

// --- PASSO IMPORTANTE: Carrega variáveis de ambiente do arquivo .env ---
dotenv.config(); 
// -----------------------------------------------------------------------

// --- LINHA DE DEBUG ADICIONADA ---
console.log('[Servidor Backend DEBUG Início] Tentando ler OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY);
// ---------------------------------

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY; 

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;

    // --- LINHA DE DEBUG ADICIONADA DENTRO DO ENDPOINT ---
    console.log(`[Servidor Backend DEBUG Endpoint] Valor de apiKey ao processar /api/previsao/${cidade}:`, apiKey);
    // ----------------------------------------------------

    if (!apiKey) { 
        console.error('[Servidor Backend] ERRO FATAL no endpoint: Chave da API OpenWeatherMap não configurada no servidor.');
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor Backend] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor Backend] Dados recebidos da OpenWeatherMap com sucesso.');
        res.json(apiResponse.data);
    } catch (error) {
        console.error("[Servidor Backend] Erro ao buscar previsão da OpenWeatherMap:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo no servidor externo.';
        res.status(status).json({ error: message });
    }
});

app.listen(port, () => {
    console.log(`Servidor backend da Garagem Inteligente rodando em http://localhost:${port}`);
    if (!process.env.OPENWEATHER_API_KEY) { 
        console.warn('[Servidor Backend ATENÇÃO Início] A variável de ambiente OPENWEATHER_API_KEY não foi carregada. Verifique seu arquivo .env na pasta backend/');
    } else {
        console.log('[Servidor Backend INFO Início] Chave da API OpenWeatherMap parece estar carregada.');
    }
});