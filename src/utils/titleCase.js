const CONNECTORS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

export const toTitleCase = (str) => {
  if (!str) return str ?? '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, index) => {
      const lower = word.toLocaleLowerCase('pt-BR');
      if (index !== 0 && CONNECTORS.has(lower)) return lower;
      return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
    })
    .join(' ');
};
