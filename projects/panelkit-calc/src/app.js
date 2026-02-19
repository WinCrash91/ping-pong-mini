const form = document.getElementById('calc-form');
const resetBtn = document.getElementById('reset');

const resPaneles = document.getElementById('res-paneles');
const resRemates = document.getElementById('res-remates');
const resTornillos = document.getElementById('res-tornillos');

function num(id) {
  return parseFloat(document.getElementById(id).value || 0);
}

function render(paneles, remates, tornillos) {
  resPaneles.textContent = paneles.toFixed(0) + ' uds';
  resRemates.textContent = remates.toFixed(2) + ' m';
  resTornillos.textContent = tornillos.toFixed(0) + ' uds';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const largo = num('largo');
  const ancho = num('ancho');
  const anchoUtil = num('anchoUtil');
  const largoPanel = num('largoPanel');
  const tornillosPorPanel = num('tornillos');
  const merma = num('merma') / 100;

  if ([largo, ancho, anchoUtil, largoPanel].some(v => v <= 0)) return;

  const panelesBase = Math.ceil((ancho / anchoUtil) * (largo / largoPanel));
  const paneles = Math.ceil(panelesBase * (1 + merma));
  const remates = 2 * (largo + ancho);
  const tornillos = paneles * tornillosPorPanel;

  render(paneles, remates, tornillos);
});

resetBtn.addEventListener('click', () => {
  form.reset();
  render(0, 0, 0);
});
