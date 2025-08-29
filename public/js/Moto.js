window.Moto = class Moto extends Veiculo {
    constructor(modelo, cor, nickname, notificationCallback) { 
        super(modelo, cor, nickname, notificationCallback); 
        this.fuelLevel = 100; 
    }
    acelerar() {
        if (this.ligado) {
            if (this.fuelLevel > 0) { super.acelerar(15); this.fuelLevel = Math.max(0, this.fuelLevel - 3); } 
            else { this.showNotification('Sem combustível!', 'error'); this.desligar(); }
        } else { this.showNotification('Ligue a moto primeiro!', 'error'); }
    }
    buzinar() { this.showNotification('BI BI!', 'info'); }
}