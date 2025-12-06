import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config(); // Esta linha carrega as variáveis do arquivo .env

import express from 'express';
// ... resto das suas importações

import Veiculo from './models/Veiculo.js';
import Dica from './models/Dica.js';
import VeiculoDestaque from './models/VeiculoDestaque.js';
// --- INÍCIO DA MODIFICAÇÃO ---
// 1. Importar o novo modelo de Manutenção
import Manutencao from './models/manutencao.js';
// --- FIM DA MODIFICAÇÃO ---

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("❌ ERRO: A variável de ambiente MONGO_URI não foi definida.");
    process.exit(1);
}
mongoose.connect(mongoUri)
    .then(() => {
        console.log('✅ Conexão com o MongoDB estabelecida com sucesso!');
        seedDatabase();
    })
    .catch((error) => {
        console.error('❌ Não foi possível conectar ao MongoDB:', error.message);
        process.exit(1);
    });

// --- API DE VEÍCULOS ---
app.get('/api/veiculos', async (req, res) => {
    try {
        const veiculos = await Veiculo.find().sort({ createdAt: -1 });
        res.json(veiculos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar veículos.' });
    }
});

app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculo = new Veiculo(req.body);
        await novoVeiculo.save();
        res.status(201).json(novoVeiculo);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: `A placa '${req.body.placa}' já está em uso.` });
        }
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculo = await Veiculo.findByIdAndDelete(req.params.id);
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        res.status(200).json({ message: 'Veículo removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover o veículo.' });
    }
});


// --- INÍCIO DA MODIFICAÇÃO ---
// 2. Adicionar Endpoints para Sub-recurso de Manutenção

// Endpoint para CRIAR uma nova manutenção para um veículo específico
app.post('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    const { veiculoId } = req.params;
    try {
        // Validação: Verificar se o veículo existe
        const veiculoExiste = await Veiculo.findById(veiculoId);
        if (!veiculoExiste) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }

        // Criar a nova manutenção associada ao veículo
        const novaManutencao = await Manutencao.create({
            ...req.body,
            veiculo: veiculoId
        });

        res.status(201).json(novaManutencao);
    } catch (error) {
        // Tratar erros de validação do Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        // Tratar outros erros
        res.status(500).json({ error: 'Erro ao criar a manutenção.' });
    }
});

// Endpoint para LISTAR todas as manutenções de um veículo específico
app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    const { veiculoId } = req.params;
    try {
         // Opcional: Validar se o veículo existe
        const veiculoExiste = await Veiculo.findById(veiculoId);
        if (!veiculoExiste) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }

        const manutencoes = await Manutencao.find({ veiculo: veiculoId })
            .sort({ data: -1 }); // Ordenar pela data mais recente

        res.status(200).json(manutencoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar as manutenções.' });
    }
});
// --- FIM DA MODIFICAÇÃO ---


// --- APIS DE DESTAQUES E CLIMA ---
app.get('/api/veiculos-destaque', async (req, res) => {
    try {
        const destaques = await VeiculoDestaque.find();
        res.json(destaques);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar veículos em destaque.' });
    }
});

// CORRIGIDO: Voltando para a API de PREVISÃO (forecast)
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API de clima não configurada.' });
    }
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json({ error: 'Erro ao buscar previsão do tempo.' });
    }
});

// Rota fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});

async function seedDatabase() {
    try {
        if (await VeiculoDestaque.countDocuments() === 0) {
            console.log('Populando destaques com dados iniciais...');
            await VeiculoDestaque.insertMany([
                 { modelo: "Ferrari 458 Italia", ano: 2015, destaque: "O pináculo da engenharia automotiva." },
                 { modelo: "Dodge Challenger R/T", ano: 1970, destaque: "Ícone da era dos 'muscle cars'." },
            ]);
        }
    } catch (error) {
        console.error("Erro ao popular o banco de dados:", error);
    }

}

