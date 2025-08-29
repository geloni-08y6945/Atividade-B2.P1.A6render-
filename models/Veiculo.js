import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: [true, 'A placa é obrigatória.'],
        uppercase: true,
        trim: true,
        // Garante que cada placa seja única em toda a coleção
        unique: true
    },
    marca: { type: String, required: [true, 'A marca é obrigatória.'], trim: true },
    modelo: { type: String, required: [true, 'O modelo é obrigatório.'], trim: true },
    ano: {
        type: Number,
        required: [true, 'O ano é obrigatório.'],
        min: [1900, 'O ano de fabricação parece inválido.'],
        max: [new Date().getFullYear() + 1, 'O ano de fabricação não pode ser no futuro.']
    },
    cor: { type: String, required: [true, 'A cor é obrigatória.'], trim: true },
    nickname: { type: String, trim: true },
    tipoVeiculo: {
        type: String,
        required: true,
        enum: ['carro', 'esportivo', 'caminhao', 'aviao', 'moto', 'bicicleta'],
        message: 'O tipo do veículo é inválido.'
    },
    // O campo userId foi removido daqui
    turbo: {
        type: Boolean,
        default: false
    },
    capacidadeCarga: {
        type: Number,
        min: [0, 'Capacidade de carga não pode ser negativa.']
    }
}, {
    timestamps: true
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;