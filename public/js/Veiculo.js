window.Veiculo = class Veiculo {
  constructor(modelo, cor, nickname, notificationCallback) {
    this.modelo = modelo;
    this.cor = cor;
    this.nickname = nickname;
    this.velocidade = 0;
    this.ligado = false;
    this.id_api = null;
    this.placa = "";
    this.marca = "";
    this.ano = 0;
    // Armazena a função de notificação
    this.showNotification = notificationCallback || console.log;
  }
  ligar() {
    if (!this.ligado) {
      this.ligado = true;
      this.showNotification(`${this.marca} ${this.modelo} ligado`, "info");
    } else {
      this.showNotification("O veículo já está ligado.", "info");
    }
  }
  desligar() {
    if (this.velocidade > 0) {
      this.showNotification(
        "Não é possível desligar o veículo em movimento!",
        "error"
      );
      return;
    }
    if (this.ligado) {
      this.ligado = false;
      this.showNotification(`${this.marca} ${this.modelo} desligado.`, "info");
    } else {
      this.showNotification("O veículo já está desligado.", "info");
    }
  }
  acelerar(incremento = 10) {
    if (this.ligado) {
      this.velocidade = Math.min(this.velocidade + incremento, 220);
    } else {
      this.showNotification("Ligue o veículo primeiro!", "error");
    }
  }
  frear(decremento = 10) {
    this.velocidade = Math.max(this.velocidade - decremento, 0);
  }
  buzinar() {
    this.showNotification("BEEP BEEP!", "info");
  }
};
