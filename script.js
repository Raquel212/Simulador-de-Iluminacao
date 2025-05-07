const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let carros = [];
let modoAtual = "tradicional";
let climaAtual = "limpo";
let tempo = 0;

let consumoEnergia = {
  tradicional: 0,
  inteligente: 0,
  sensor: 0,
};

let postesDeEnergia = [];
let gotasDeChuva = [];

const pistaAltura = 50;
const pistaY = (canvas.height - pistaAltura) / 2;

document.getElementById("toggleModo").addEventListener("click", () => {
  const modos = ["tradicional", "inteligente", "sensor"];
  const indiceAtual = modos.indexOf(modoAtual);
  modoAtual = modos[(indiceAtual + 1) % modos.length];

  tempo = 0;
  document.getElementById("toggleModo").textContent = `Modo: ${modoAtual.charAt(0).toUpperCase() + modoAtual.slice(1)}`;
});

document.getElementById("toggleClima").addEventListener("click", () => {
  climaAtual = climaAtual === "limpo" ? "chuva" : "limpo";
  document.getElementById("toggleClima").textContent = `Clima: ${climaAtual.charAt(0).toUpperCase() + climaAtual.slice(1)}`;
  if (climaAtual === "chuva") {
    gotasDeChuva = Array.from({ length: 100 }, criarGota);
  }
});

function criarCarro() {
  return {
    x: -50,
    y: pistaY + 10,
    cor: `hsl(${Math.random() * 360}, 80%, 60%)`,
    velocidade: 2,
  };
}

function criarPostes() {
  postesDeEnergia = [];
  const espacamento = 150;
  for (let i = 0; i < canvas.width; i += espacamento) {
    postesDeEnergia.push({ x: i + 20, ligado: true });
  }
}

function criarGota() {
  return {
    x: Math.random() * canvas.width,
    y: -10,
    largura: Math.random() * 2 + 1, 
    altura: Math.random() * 5 + 5,  
    velocidade: Math.random() * 4 + 3, 
  };
}

function desenharCenario() {
  ctx.fillStyle = climaAtual === "limpo" ? "#87CEEB" : "#A9A9A9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function desenharChuva() {
  if (climaAtual === "chuva") {
    ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
    gotasDeChuva.forEach((gota, index) => {
      ctx.fillRect(gota.x, gota.y, gota.largura, gota.altura);
      gota.y += gota.velocidade;
      if (gota.y > canvas.height) {
        gotasDeChuva[index] = criarGota();
      }
    });
  }
}

function desenharPista() {
  ctx.fillStyle = "#374151";
  ctx.fillRect(0, pistaY, canvas.width, pistaAltura);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, pistaY + pistaAltura / 2);
    ctx.lineTo(x + 30, pistaY + pistaAltura / 2);
    ctx.stroke();
  }
}

function desenharPostes() {
  postesDeEnergia.forEach(({ x, ligado }) => {
    const alturaPoste = 60;
    ctx.fillStyle = "#4B5563";
    ctx.fillRect(x, pistaY - alturaPoste, 6, alturaPoste);
    ctx.fillStyle = ligado
      ? climaAtual === "chuva"
        ? "#fde047"
        : "#facc15"
      : "#374151";
    ctx.beginPath();
    ctx.arc(x + 3, pistaY - alturaPoste + 10, 6, 0, 2 * Math.PI);
    ctx.fill();
  });
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  this.beginPath();
  this.moveTo(x + r, y);
  this.lineTo(x + w - r, y);
  this.quadraticCurveTo(x + w, y, x + w, y + r);
  this.lineTo(x + w, y + h - r);
  this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  this.lineTo(x + r, y + h);
  this.quadraticCurveTo(x, y + h, x, y + h - r);
  this.lineTo(x, y + r);
  this.quadraticCurveTo(x, y, x + r, y);
  this.closePath();
};

function desenharCarros() {
  carros.forEach(({ x, y, cor }) => {
    ctx.fillStyle = cor;
    ctx.roundRect(x, y, 50, 25, 6);
    ctx.fill();
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(x + 8, y + 5, 15, 10);
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(x + 10, y + 25, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 40, y + 25, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function atualizarCarros() {
  carros.forEach((carro) => {
    carro.x += carro.velocidade;
    if (carro.x > canvas.width) carro.x = -60;
  });

  if (Math.random() < 0.01 && carros.length < 5) {
    carros.push(criarCarro());
  }

  carros = carros.filter((carro) => carro.x < canvas.width + 100);
}

function alternarPostesDeEnergia() {
  switch (modoAtual) {
    case "inteligente":
      postesDeEnergia.forEach((poste, i) => {
        if (i % 2 === 0) poste.ligado = !poste.ligado;
      });
      break;
    case "sensor":
      postesDeEnergia.forEach((poste) => {
        poste.ligado = carros.some((carro) => Math.abs(carro.x - poste.x) < 60);
      });
      break;
    default:
      postesDeEnergia.forEach((poste) => (poste.ligado = true));
  }
}

function atualizar() {
  tempo++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenharCenario();
  desenharChuva();
  desenharPista();
  desenharPostes();
  desenharCarros();
  atualizarCarros();
  alternarPostesDeEnergia();

  const climaFator = climaAtual === "chuva" ? 1.3 : 1;

  if (modoAtual === "inteligente") {
    consumoEnergia.inteligente += carros.length * 0.02 * climaFator;
  } else if (modoAtual === "sensor") {
    const postesLigados = postesDeEnergia.filter((p) => p.ligado).length;
    consumoEnergia.sensor += postesLigados * 0.01 * climaFator;
  } else {
    consumoEnergia.tradicional += carros.length * 0.05 * climaFator;
  }

  const consumo = consumoEnergia[modoAtual];
  const totalVelocidade = carros.reduce((acc, c) => acc + c.velocidade, 0);
  const mediaVelocidade = carros.length ? totalVelocidade / carros.length : 0;

  document.getElementById("carCount").textContent = carros.length;
  document.getElementById("avgSpeed").textContent = `${(mediaVelocidade * 30).toFixed(1)} km/h`;
  document.getElementById("energyUsage").textContent = `${consumo.toFixed(2)} kWh`;

  const agora = new Date();
  document.getElementById("clock").textContent = agora.toLocaleTimeString("pt-BR");

  requestAnimationFrame(atualizar);
}

criarPostes();
atualizar();
