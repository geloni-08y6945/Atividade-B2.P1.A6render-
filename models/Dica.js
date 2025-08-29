import mongoose from 'mongoose';

const DicaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    tipo: {
        type: String,
        required: true,
        enum: ['geral', 'carro', 'esportivo', 'caminhao', 'aviao', 'moto', 'bicicleta'],
        default: 'geral'
    },
    urgencia: {
        type: String,
        enum: ['baixa', 'media', 'alta'],
        default: 'baixa'
    },
    custoEstimado: {
        type: Number,
        min: 0
    }
});

const Dica = mongoose.model('Dica', DicaSchema);

export default Dica;