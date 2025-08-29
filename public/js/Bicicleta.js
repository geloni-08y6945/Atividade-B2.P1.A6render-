window.Bicicleta = class Bicicleta extends Veiculo {
    constructor(modelo, cor, nickname, notificationCallback) { 
        super(modelo, cor, nickname, notificationCallback); 
    }
    ligar() { this.showNotification('Bicicletas não precisam ser ligadas!', 'info'); }
    desligar() {}
    acelerar() { this.velocidade = Math.min(this.velocidade + 5, 50); }
    frear(){ this.velocidade = Math.max(0, this.velocidade - 7); }
    buzinar() { this.showNotification('TRIM TRIM!', 'info'); }
}