// ======================================================
// Arquivo: backend/server.js
// Servidor completo com proxy para clima e CRUD para veículos.
// ======================================================
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Importa o nosso novo Modelo de Veículo
import Veiculo from './models/Veiculo.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Permite que o servidor entenda JSON

// Conexão com o MongoDB Atlas
const mongoUri = process.env.MONGO_URI_CRUD;
if (!mongoUri) {
    console.error("❌ ERRO CRÍTICO: A variável de ambiente MONGO_URI_CRUD não está definida no seu arquivo .env");
    process.exit(1); // Encerra a aplicação se a URI não estiver configurada
}

mongoose.connect(mongoUri)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas para a Garagem!'))
    .catch((error) => console.error('❌ Erro ao conectar ao MongoDB Atlas:', error));


// --- ROTA DE PROXY PARA A API DE PREVISÃO DO TEMPO (Mantida) ---
app.get('/api/previsao/:cidade', async (req, res) => {
    // ... seu código de previsão do tempo continua aqui, sem alterações ...
    // (Omitido para economizar espaço, mantenha o seu)
});


// --- ROTAS DO CRUD DE VEÍCULOS (NOVIDADE DA ATIVIDADE) ---

// [C]REATE: Rota para criar um novo veículo (Endpoint POST)
app.post('/api/veiculos', async (req, res) => {
    try {
        const dadosVeiculo = req.body;
        const veiculoCriado = await Veiculo.create(dadosVeiculo);
        console.log('[Servidor] Veículo salvo no DB:', veiculoCriado);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        console.error("[Servidor] Erro ao salvar veículo:", error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Conflito: Veículo com esta placa já existe.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: `Dados inválidos: ${messages.join(' ')}` });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao criar veículo.' });
    }
});

// [R]EAD: Rota para ler todos os veículos (Endpoint GET)
app.get('/api/veiculos', async (req, res) => {
    try {
        const todosOsVeiculos = await Veiculo.find().sort({ createdAt: -1 }); // Busca todos, ordenados pelos mais novos
        console.log('[Servidor] Enviando lista de veículos do DB.');
        res.json(todosOsVeiculos);
    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar veículos.' });
    }
});


// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});