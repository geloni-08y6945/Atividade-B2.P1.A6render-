window.Caminhao = class Caminhao extends Veiculo {
    constructor(modelo, cor, nickname, capacidadeCarga = 10000, notificationCallback) {
        super(modelo, cor, nickname, notificationCallback);
        this.fuelLevel = 100;
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }
    acelerar() {
        if (this.ligado) {
            if (this.fuelLevel > 0) {
                const fatorCarga = 1 - (this.cargaAtual / (this.capacidadeCarga * 2));
                const incremento = Math.max(2, 8 * fatorCarga);
                super.acelerar(incremento);
                this.fuelLevel = Math.max(0, this.fuelLevel - 5);
            } else { this.showNotification('Sem combustível!', 'error'); this.desligar(); }
        } else { this.showNotification('Ligue o caminhão primeiro!', 'error'); }
    }
    carregar(peso) {
        if (this.cargaAtual + peso > this.capacidadeCarga) { this.showNotification('Capacidade máxima de carga excedida!', 'error'); } 
        else { this.cargaAtual += peso; this.showNotification(`${peso}kg carregados. Carga atual: ${this.cargaAtual}kg.`, 'info'); }
    }
    descarregar(peso) {
        this.cargaAtual = Math.max(0, this.cargaAtual - peso);
        this.showNotification(`${peso}kg descarregados. Carga atual: ${this.cargaAtual}kg.`, 'info');
    }
}