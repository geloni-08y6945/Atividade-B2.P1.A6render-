import mongoose from 'mongoose';

const VeiculoDestaqueSchema = new mongoose.Schema({
    modelo: { type: String, required: true },
    ano: { type: Number, required: true },
    destaque: { type: String, required: true },
});

const VeiculoDestaque = mongoose.model('VeiculoDestaque', VeiculoDestaqueSchema);

export default VeiculoDestaque;