import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoriaSelectField from './index';

// Mock do serviço — evita chamadas HTTP reais
vi.mock('../../service/CategoriaService', () => ({
  categoriaService: {
    listarCategoriasPaginadas: vi.fn(),
  },
}));

import { categoriaService } from '../../service/CategoriaService';

const mockCategoriasResponse = (categorias) => ({
  data: {
    content: categorias,
    page: 0,
    totalPages: 1,
    totalElements: categorias.length,
    last: true,
  },
});

const renderField = (props = {}) => {
  const defaults = {
    label: 'Categoria',
    value: 'Todas',
    onChange: vi.fn(),
    allOptionLabel: 'Todas',
  };
  return render(<CategoriaSelectField {...defaults} {...props} />);
};

beforeEach(() => {
  categoriaService.listarCategoriasPaginadas.mockResolvedValue(
    mockCategoriasResponse([
      { id: 1, nome: 'yoga' },
      { id: 2, nome: 'pilates' },
      { id: 3, nome: 'academia de boxe' },
    ])
  );
});

describe('CategoriaSelectField', () => {
  // H1 — opções exibem texto em Title Case mas o value continua raw (minúsculo)
  it('renderiza opções com texto em Title Case', async () => {
    renderField();

    await waitFor(() => {
      // O Select deve estar habilitado após o carregamento
      expect(screen.queryByRole('combobox')).not.toBeDisabled();
    });

    // Abre o Select
    await userEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Yoga')).toBeInTheDocument();
      expect(within(listbox).getByText('Pilates')).toBeInTheDocument();
      expect(within(listbox).getByText('Academia de Boxe')).toBeInTheDocument();
    });
  });

  // H2 — ao selecionar, onChange recebe o nome raw (minúsculo), não Title Case
  it('chama onChange com o nome raw ao selecionar', async () => {
    const onChange = vi.fn();
    renderField({ onChange });

    await waitFor(() => expect(screen.queryByRole('combobox')).not.toBeDisabled());

    await userEvent.click(screen.getByRole('combobox'));

    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByText('Yoga'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'yoga' })
    );
  });

  // H3 — opção "Todas" está presente como primeira opção
  it('renderiza a opção "Todas" como primeira opção', async () => {
    renderField({ allOptionLabel: 'Todas' });

    await waitFor(() => expect(screen.queryByRole('combobox')).not.toBeDisabled());
    await userEvent.click(screen.getByRole('combobox'));

    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options[0]).toHaveTextContent('Todas');
  });
});
