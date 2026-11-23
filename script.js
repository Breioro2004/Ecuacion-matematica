const form = document.querySelector('#cost-form');
const quantity = document.querySelector('#quantity');
const error = document.querySelector('#input-error');
const results = document.querySelector('#results');
const equationSteps = document.querySelector('#equation-steps');
const downloadButton = document.querySelector('#download-report');
const reportStatus = document.querySelector('#report-status');

const fixedCost = 60000;
const chocolate = 9000;
const packaging = 2500;
const labor = 1500;
const costPerBall = chocolate + packaging + labor;
const formula = 'C(n) = 60.000 + 13.000n';

const number = new Intl.NumberFormat('es-CO', {
  useGrouping: 'always',
  maximumFractionDigits: 2,
});
const format = (value) => number.format(value);
const money = (value) => '$' + format(value) + ' COP';

let currentCalculation;

function geometrySteps(count) {
  const diameter = 12;
  const radius = diameter / 2;
  const sphereCoefficient = 4 * radius ** 2;
  const sphereArea = sphereCoefficient * Math.PI;
  const side = 14;
  const faceArea = side ** 2;
  const boxArea = 6 * faceArea;
  const wasteAllowance = boxArea / 10;
  const cardboardPerBox = boxArea + wasteAllowance;
  const cardboardTotal = cardboardPerBox * count;
  const squareCentimetersPerSquareMeter = 10000;
  const units = format(count);

  return {
    surface: [
      ['Hallar el radio a partir del diámetro', 'r = ' + diameter + ' ÷ 2 = ' + radius + ' cm'],
      ['Elevar el radio al cuadrado', radius + '² = ' + format(radius ** 2) + ' cm²'],
      ['Calcular el área de un balón', 'A = 4 × π × ' + format(radius ** 2) + ' = ' +
        format(sphereCoefficient) + 'π cm² ≈ ' + format(sphereArea) + ' cm²'],
      ['Multiplicar por la cantidad del lote', units + ' × ' + format(sphereCoefficient) + 'π cm² ≈ ' +
        format(count * sphereArea) + ' cm²'],
      ['Convertir el área del lote a metros cuadrados', 'A del lote ≈ ' +
        format(count * sphereArea / squareCentimetersPerSquareMeter) + ' m² (1 m² = 10.000 cm²)'],
    ],
    packaging: [
      ['Calcular el área de una cara', side + ' cm × ' + side + ' cm = ' + format(faceArea) + ' cm²'],
      ['Sumar las seis caras', '6 × ' + format(faceArea) + ' = ' + format(boxArea) + ' cm²'],
      ['Agregar el 10 % para pestañas y recortes', format(boxArea) + ' × 0,10 = ' +
        format(wasteAllowance) + ' cm² adicionales'],
      ['Calcular el cartón por caja', format(boxArea) + ' + ' + format(wasteAllowance) + ' = ' +
        format(cardboardPerBox) + ' cm²'],
      ['Multiplicar por la cantidad de cajas', units + ' × ' + format(cardboardPerBox) + ' = ' +
        format(cardboardTotal) + ' cm²'],
      ['Convertir el cartón del lote a metros cuadrados', format(cardboardTotal) + ' ÷ 10.000 ≈ ' +
        format(cardboardTotal / squareCentimetersPerSquareMeter) + ' m²'],
    ],
  };
}

function renderSteps(list, steps) {
  list.replaceChildren(...steps.map(([label, operation]) => {
    const item = document.createElement('li');
    const detail = document.createElement('span');
    detail.textContent = operation;
    item.append(label, detail);
    return item;
  }));
}

function calculate(count, inverseStep) {
  const units = format(count);
  const variableCost = costPerBall * count;
  const total = fixedCost + variableCost;
  const average = total / count;
  const steps = [
    ['Identificar el costo fijo', 'Molde reutilizable = ' + money(fixedCost)],
    ['Sumar los costos de un balón', 'Chocolate + caja + mano de obra = ' +
      format(chocolate) + ' + ' + format(packaging) + ' + ' + format(labor) + ' = ' + money(costPerBall)],
    ['Plantear la ecuación', formula + ', donde n es la cantidad de balones.'],
    ['Sustituir la cantidad', 'C(' + units + ') = ' + format(fixedCost) + ' + ' + format(costPerBall) + ' × ' + units],
    ['Calcular el costo variable del lote', format(costPerBall) + ' × ' + units + ' = ' + money(variableCost)],
    ['Sumar el costo fijo y el variable', format(fixedCost) + ' + ' + format(variableCost) + ' = ' + money(total)],
    ['Calcular el costo promedio por balón', format(total) + ' ÷ ' + units + ' ≈ ' + money(average)],
  ];
  if (inverseStep) steps.splice(3, 0, ['Despejar la cantidad', inverseStep]);

  const geometry = geometrySteps(count);
  currentCalculation = { count, steps, total, average, geometry };
  renderSteps(equationSteps, steps);
  renderSteps(document.querySelector('#surface-steps'), geometry.surface);
  renderSteps(document.querySelector('#packaging-steps'), geometry.packaging);
  document.querySelector('#geometry-quantity').textContent =
    'Último lote calculado: ' + units + (count === 1 ? ' balón y 1 caja.' : ' balones y ' + units + ' cajas.');
  document.querySelector('#total').textContent = money(total);
  document.querySelector('#average').textContent = money(average);
  results.hidden = false;
  reportStatus.textContent = 'El informe incluye el procedimiento y los resultados del cálculo para ' + units +
    (count === 1 ? ' balón.' : ' balones.');
  downloadButton.disabled = false;
}

function clearCalculation(message) {
  currentCalculation = undefined;
  results.hidden = true;
  downloadButton.disabled = true;
  reportStatus.textContent = message;
}

function clearQuantityError() {
  error.hidden = true;
  quantity.removeAttribute('aria-invalid');
}

quantity.addEventListener('input', () => {
  clearQuantityError();
  clearCalculation('Pulsa Calcular para actualizar los resultados y habilitar la descarga.');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const count = quantity.valueAsNumber;
  if (!quantity.validity.valid || !Number.isInteger(count)) {
    error.textContent = 'Ingresa un número entero entre 1 y 1.000.000.';
    error.hidden = false;
    quantity.setAttribute('aria-invalid', 'true');
    clearCalculation('Corrige la cantidad y vuelve a calcular para generar el informe.');
    quantity.focus();
    return;
  }

  clearQuantityError();
  calculate(count);
});

const inverseForm = document.querySelector('#inverse-form');
const knownCost = document.querySelector('#known-cost');
const inverseResult = document.querySelector('#inverse-result');

inverseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const total = knownCost.valueAsNumber;
  if (!knownCost.validity.valid || !Number.isSafeInteger(total)) {
    inverseResult.textContent = 'Ingresa un costo total en pesos enteros entre $73.000 y $13.000.060.000 COP.';
    knownCost.setAttribute('aria-invalid', 'true');
    clearCalculation('Ingresa un costo válido o calcula el costo a partir de la cantidad.');
    knownCost.focus();
    return;
  }

  knownCost.removeAttribute('aria-invalid');
  const count = (total - fixedCost) / costPerBall;
  const steps = 'n = (' + format(total) + ' − ' + format(fixedCost) + ') ÷ ' + format(costPerBall);
  if (!Number.isInteger(count)) {
    inverseResult.textContent = steps + ' ≈ ' + format(count) +
      '. Ese costo no corresponde exactamente a una cantidad entera de balones.';
    clearCalculation('Para descargar el informe, resuelve la ecuación con una cantidad entera de balones.');
    return;
  }

  const solution = steps + ' = ' + format(count) + (count === 1 ? ' balón' : ' balones');
  inverseResult.textContent = solution;
  quantity.value = count;
  clearQuantityError();
  calculate(count, solution);
});

// RTF admite caracteres Unicode mediante secuencias de escape.
function rtfText(value) {
  return value.replace(/[\\{}\u0080-\uFFFF]/g, (character) => {
    const code = character.charCodeAt(0);
    return code < 128 ? '\\' + character : '\\u' + (code > 32767 ? code - 65536 : code) + '?';
  });
}

downloadButton.addEventListener('click', () => {
  if (!currentCalculation) return;
  const { count, steps, total, average, geometry } = currentCalculation;
  const paragraphs = [
    'Breinner Stiven Orozco Salas | SENA | Ficha 3465955',
    'Cantidad de balones: ' + format(count),
    '',
    'Superficie exterior del balón',
    ...geometry.surface.map(([label, operation]) => label + ': ' + operation),
    '',
    'Cartón para el empaque',
    ...geometry.packaging.map(([label, operation]) => label + ': ' + operation),
    '',
    'Costo del lote',
    ...steps.map(([label, operation], index) => (index + 1) + '. ' + label + ': ' + operation),
    '',
    'Costo total del lote: ' + money(total),
    'Costo promedio por balón: ' + money(average),
  ];
  const content = '{\\rtf1\\ansi\\uc1\\deff0{\\fonttbl{\\f0 Calibri;}}\\f0\\fs24 ' +
    '\\b\\fs36 ' + rtfText('Informe de resultados | Balón de chocolate') + '\\b0\\fs24\\par\\par ' +
    paragraphs.map(rtfText).join('\\par\n') + '}';
  const url = URL.createObjectURL(new Blob([content], { type: 'application/rtf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Informe_Balon_de_Chocolate_' + count + '_unidades.rtf';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

calculate(quantity.valueAsNumber);
