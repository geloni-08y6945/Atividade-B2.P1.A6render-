window.Carro = class Carro extends Veiculo {
    constructor(modelo, cor, nickname, notificationCallback) { 
        super(modelo, cor, nickname, notificationCallback); 
        this.fuelLevel = 100; 
    }
    acelerar(incremento = 10) {
        if (this.ligado) {
            if (this.fuelLevel > 0) { super.acelerar(incremento); this.fuelLevel = Math.max(0, this.fuelLevel - 2); } 
            else { this.showNotification('Sem combustível!', 'error'); this.desligar(); }
        } else { this.showNotification('Ligue o carro primeiro!', 'error'); }
    }
}