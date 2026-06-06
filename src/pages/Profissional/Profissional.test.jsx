import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profissional from './index';

// Mocks de dependências externas
vi.mock('../../service/ProfissionalService', () => ({
  profissionalService: {
    listarProfissionais: vi.fn(),
  },
}));

vi.mock('../../service/CategoriaService', () => ({
  categoriaService: {
    listarCategoriasPaginadas: vi.fn(),
  },
}));

import { profissionalService } from '../../service/ProfissionalService';
import { categoriaService } from '../../service/CategoriaService';

const makeProfissional = (overrides = {}) => ({
  id: 1,
  nome: 'João da Silva',
  email: 'joao@test.com',
  regiao: 'norte',
  especialidades: ['yoga'],
  gradeAtividades: [{ categoriaNome: 'yoga' }],
  ...overrides,
});

const mockCategoriasResponse = (categorias) => ({
  data: {
    content: categorias,
    page: 0,
    totalPages: 1,
    totalElements: categorias.length,
    last: true,
  },
});

beforeEach(() => {
  categoriaService.listarCategoriasPaginadas.mockResolvedValue(
    mockCategoriasResponse([
      { id: 1, nome: 'yoga' },
      { id: 2, nome: 'pilates' },
    ])
  );

  profissionalService.listarProfissionais.mockResolvedValue({
    data: [
      makeProfissional({ id: 1, nome: 'João da Silva', especialidades: ['yoga'], gradeAtividades: [{ categoriaNome: 'yoga' }] }),
      makeProfissional({ id: 2, nome: 'Maria Oliveira', especialidades: ['pilates'], gradeAtividades: [{ categoriaNome: 'pilates' }] }),
    ],
  });
});

describe('Página Profissional', () => {
  // J1 — filtro por categoria não retorna lista vazia quando há profissionais compatíveis
  it('filtra profissionais por categoria selecionada corretamente', async () => {
    render(<Profissional />);

    // Aguarda carregamento
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    // Abre o select de categoria
    const combobox = await screen.findByRole('combobox');
    await waitFor(() => expect(combobox).not.toBeDisabled());
    await userEvent.click(combobox);

    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByText('Yoga'));

    // Deve continuar exibindo o card do profissional de yoga
    await waitFor(() => {
      expect(screen.queryByText('Nenhum profissional encontrado.')).not.toBeInTheDocument();
    });
  });

  // J2 — rótulo dinâmico exibe o nome da categoria em Title Case
  it('exibe texto de filtro ativo em Title Case', async () => {
    render(<Profissional />);

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    const combobox = await screen.findByRole('combobox');
    await waitFor(() => expect(combobox).not.toBeDisabled());
    await userEvent.click(combobox);

    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByText('Pilates'));

    await waitFor(() => {
      expect(screen.getByText(/Pilates/)).toBeInTheDocument();
    });
  });

  // J3 — sem filtro ativo, todos os profissionais são exibidos
  it('exibe todos os profissionais sem filtro ativo', async () => {
    render(<Profissional />);

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    await waitFor(() => {
      expect(screen.queryByText('Nenhum profissional encontrado.')).not.toBeInTheDocument();
    });
  });
});
