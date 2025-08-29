window.Aviao = class Aviao extends Veiculo {
    constructor(modelo, cor, nickname, notificationCallback) { 
        super(modelo, cor, nickname, notificationCallback); 
        this.fuelLevel = 100; this.altitude = 0; 
    }
    decolar() {
        if (this.ligado && this.velocidade > 180) { this.altitude = 1000; this.showNotification('Aeronave decolou!', 'info'); } 
        else { this.showNotification('Acelere para mais de 180km/h para decolar.', 'error'); }
    }
    pousar() { this.altitude = 0; this.showNotification('Aeronave pousou.', 'info'); }
}