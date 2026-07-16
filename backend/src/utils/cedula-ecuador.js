const PROVINCIAS = {
  '01': 'Azuay',
  '02': 'Bolivar',
  '03': 'Canar',
  '04': 'Carchi',
  '05': 'Cotopaxi',
  '06': 'Chimborazo',
  '07': 'El Oro',
  '08': 'Esmeraldas',
  '09': 'Guayas',
  '10': 'Imbabura',
  '11': 'Loja',
  '12': 'Los Rios',
  '13': 'Manabi',
  '14': 'Morona Santiago',
  '15': 'Napo',
  '16': 'Pastaza',
  '17': 'Pichincha',
  '18': 'Tungurahua',
  '19': 'Zamora Chinchipe',
  '20': 'Galapagos',
  '21': 'Sucumbios',
  '22': 'Orellana',
  '23': 'Santo Domingo de los Tsachilas',
  '24': 'Santa Elena',
  '30': 'Ecuatorianos en el exterior'
};

function validateCedulaEcuador(cedula) {
  const value = String(cedula || '').trim();

  if (!/^\d{10}$/.test(value)) {
    return { valid: false, provincia: null };
  }

  const provinciaCodigo = value.slice(0, 2);
  const provincia = PROVINCIAS[provinciaCodigo] || null;
  const tercerDigito = Number(value[2]);

  if (!provincia || tercerDigito >= 6) {
    return { valid: false, provincia: null };
  }

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = coeficientes.reduce((total, coeficiente, index) => {
    let producto = Number(value[index]) * coeficiente;
    if (producto >= 10) producto -= 9;
    return total + producto;
  }, 0);

  const verificadorCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  const verificadorIngresado = Number(value[9]);

  return {
    valid: verificadorCalculado === verificadorIngresado,
    provincia: verificadorCalculado === verificadorIngresado ? provincia : null
  };
}

module.exports = {
  validateCedulaEcuador,
  PROVINCIAS
};
