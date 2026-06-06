import { describe, it, expect } from 'vitest';
import { toTitleCase } from './titleCase';

describe('toTitleCase', () => {
  // G1 — caminho feliz
  it('capitaliza a primeira letra de cada palavra', () => {
    expect(toTitleCase('academia de boxe')).toBe('Academia de Boxe');
  });

  // G2 — conector em posição não-inicial fica minúsculo
  it('mantém "de" minúsculo em posição não-inicial', () => {
    expect(toTitleCase('futebol de praia')).toBe('Futebol de Praia');
  });

  it('mantém "da" minúsculo em posição não-inicial', () => {
    expect(toTitleCase('dança da chuva')).toBe('Dança da Chuva');
  });

  it('mantém "do" minúsculo em posição não-inicial', () => {
    expect(toTitleCase('artes do mar')).toBe('Artes do Mar');
  });

  it('mantém "das" minúsculo em posição não-inicial', () => {
    expect(toTitleCase('escola das artes')).toBe('Escola das Artes');
  });

  it('mantém "dos" minúsculo em posição não-inicial', () => {
    expect(toTitleCase('capoeira dos mestres')).toBe('Capoeira dos Mestres');
  });

  it('mantém "e" minúsculo em posição não-inicial', () => {
    expect(toTitleCase('yoga e pilates')).toBe('Yoga e Pilates');
  });

  // G3 — conector como PRIMEIRA palavra capitaliza
  it('capitaliza conector quando é a primeira palavra', () => {
    expect(toTitleCase('de tudo um pouco')).toBe('De Tudo um Pouco');
  });

  // G4 — cobertura completa da lista de conectores
  it('combinação de múltiplos conectores', () => {
    expect(toTitleCase('academia de luta e artes das ruas dos becos'))
      .toBe('Academia de Luta e Artes das Ruas dos Becos');
  });

  // G5 — guards de null / vazio
  it('retorna string vazia para null', () => {
    expect(toTitleCase(null)).toBe('');
  });

  it('retorna string vazia para string vazia', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('retorna string vazia para string só de espaços', () => {
    expect(toTitleCase('   ')).toBe('');
  });

  it('retorna string vazia para undefined', () => {
    expect(toTitleCase(undefined)).toBe('');
  });

  // G6 — colapso de espaços múltiplos
  it('colapsa espaços internos múltiplos', () => {
    expect(toTitleCase('academia  de  boxe')).toBe('Academia de Boxe');
  });

  it('ignora espaços nas extremidades', () => {
    expect(toTitleCase('  yoga  ')).toBe('Yoga');
  });

  // G7 — acentos pt-BR via toLocaleUpperCase('pt-BR')
  it('capitaliza corretamente letra com acento', () => {
    expect(toTitleCase('natação')).toBe('Natação');
  });

  it('capitaliza ç corretamente', () => {
    expect(toTitleCase('capoeira')).toBe('Capoeira');
  });

  it('não destrói acentos em letras já minúsculas', () => {
    expect(toTitleCase('academia de natação')).toBe('Academia de Natação');
  });

  // case já em Title Case deve ser idempotente
  it('é idempotente quando já está em Title Case', () => {
    expect(toTitleCase('Academia de Boxe')).toBe('Academia de Boxe');
  });
});
