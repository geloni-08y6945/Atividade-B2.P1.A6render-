window.Esportivo = class Esportivo extends Carro {
    constructor(modelo, cor, nickname, turbo = false, notificationCallback) { 
        super(modelo, cor, nickname, notificationCallback); 
        this.temTurbo = turbo; this.turboAtivo = false; 
    }
    ativarTurbo() {
        if (!this.temTurbo) { this.showNotification('Este veículo não possui turbo!', 'error'); return; }
        if (!this.ligado) { this.showNotification('Ligue o carro para ativar o turbo.', 'error'); return; }
        this.turboAtivo = !this.turboAtivo;
        this.showNotification(`Turbo ${this.turboAtivo ? 'ATIVADO' : 'DESATIVADO'}!`, 'info');
    }
    acelerar() {
        if (this.ligado) {
            const incremento = this.turboAtivo ? 30 : 15;
            const consumo = this.turboAtivo ? 8 : 4;
            if (this.fuelLevel > 0) { super.acelerar(incremento); this.fuelLevel = Math.max(0, this.fuelLevel - consumo); } 
            else { this.showNotification('Sem combustível!', 'error'); this.desligar(); }
        } else { this.showNotification('Ligue o carro primeiro!', 'error'); }
    }
}