// server.js

// Importações dos módulos necessários
import express from 'express';    // Framework para o servidor web
import dotenv from 'dotenv';      // Para carregar variáveis de ambiente
import axios from 'axios';
import path from 'path';         // Para trabalhar com caminhos de arquivos

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Carrega variáveis de ambiente do arquivo .env para process.env
dotenv.config();

// --- CORREÇÃO PARA __filename e __dirname com ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // Use __filename aqui

// Inicializa o aplicativo Express
const app = express(); // Mova a inicialização do app para ANTES de usá-lo

// --- CORREÇÃO: Servir arquivos estáticos (se você tiver uma pasta 'public') ---
// Se você tem arquivos frontend (HTML, CSS, JS do cliente) na pasta 'public'
// e quer que o backend os sirva, use isso.
// Se seu frontend é um projeto separado (React, Vue, ou HTML simples em outra pasta/deploy),
// você pode remover ou comentar esta linha.
// Para a atividade atual, onde o frontend é provavelmente um index.html simples,
// e se ele estiver numa pasta 'public' na raiz do projeto, isso seria útil.
// Se não, apenas comente.
// app.use(express.static(path.join(__dirname, 'public')));

// Define a porta para o servidor backend.
const port = process.env.PORT || 3001;

// Pega a chave da API OpenWeatherMap das variáveis de ambiente
const apiKey = process.env.OPENWEATHER_API_KEY;

/**
 * Middleware para habilitar CORS (Cross-Origin Resource Sharing).
 */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
app.get('/api/previsao/:cidade', async (req, res) => {
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

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando na porta ${port}`); // Ajustado para pegar a porta do Render
    console.log('Aperte CTRL+C para parar o servidor se rodando localmente.');
});