const PESOS_CNPJ_D1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ_D2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function calcularDigitoCnpj(str, pesos) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += (str.charCodeAt(i) - 48) * pesos[i];
  const resto = sum % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCpf(cpf) {
  const digits = String(cpf ?? "").replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  const d1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (Number(digits[9]) !== d1) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  const d2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return Number(digits[10]) === d2;
}

export function validarCnpj(cnpj) {
  const cleaned = String(cnpj ?? "").replace(/[.\-/]/g, "").toUpperCase();
  if (cleaned.length !== 14) return false;

  const dv1 = cleaned[12];
  const dv2 = cleaned[13];
  if (!/\d/.test(dv1) || !/\d/.test(dv2)) return false;

  if (calcularDigitoCnpj(cleaned.slice(0, 12), PESOS_CNPJ_D1) !== Number(dv1)) return false;
  if (calcularDigitoCnpj(cleaned.slice(0, 13), PESOS_CNPJ_D2) !== Number(dv2)) return false;
  return true;
}
