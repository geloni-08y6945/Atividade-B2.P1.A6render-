// ======================================================
// Arquivo: backend/models/Veiculo.js
// Define a estrutura (Schema) dos dados para a coleção 'veiculos'.
// ======================================================
import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema(
    {
        placa: {
            type: String,
            required: [true, 'A placa é obrigatória.'],
            unique: true, // Garante que não haverá duas placas iguais.
            uppercase: true,
            trim: true
        },
        marca: {
            type: String,
            required: [true, 'A marca é obrigatória.'],
            trim: true
        },
        modelo: {
            type: String,
            required: [true, 'O modelo é obrigatório.'],
            trim: true
        },
        ano: {
            type: Number,
            required: [true, 'O ano é obrigatório.'],
            min: [1900, 'O ano de fabricação parece inválido.'],
            max: [new Date().getFullYear() + 1, 'O ano de fabricação não pode ser no futuro.']
        },
        cor: {
            type: String,
            required: [true, 'A cor é obrigatória.'],
            trim: true
        },
        nickname: { type: String, trim: true },
        imagem: { type: String, trim: true }, // Em uma próxima fase, isso pode apontar para uma URL de imagem
        tipoVeiculo: {
            type: String,
            required: true,
            enum: ['carro', 'esportivo', 'caminhao', 'aviao', 'moto', 'bicicleta'],
            message: 'O tipo do veículo é inválido.'
        }
    },
    {
        timestamps: true // Adiciona createdAt e updatedAt automaticamente
    }
);

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;