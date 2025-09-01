import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';
import BookListItem from '@/components/BookListItem';

const baseProps = {
  title: 'Clean Code',
  imageUrl: 'https://example.com/cover.jpg',
  author: 'Robert C. Martin',
};

describe('BookListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza título y autor', () => {
    renderWithProviders(<BookListItem {...baseProps} />);
    expect(screen.getByText(/clean code/i)).toBeTruthy();
    expect(screen.getByText(/robert c\. martin/i)).toBeTruthy();
  });

  it('muestra botón eliminar solo cuando showDeleteButton=true', () => {
    const { rerender } = renderWithProviders(<BookListItem {...baseProps} />);

    expect(screen.queryByTestId('delete-button')).toBeNull();

    rerender(<BookListItem {...baseProps} showDeleteButton />);
    expect(screen.getByTestId('delete-button')).toBeTruthy();
  });

  it('botón eliminar deshabilitado cuando canDelete=false, no llama onDeletePress', () => {
    const onDeletePress = jest.fn();
    renderWithProviders(
      <BookListItem
        {...baseProps}
        showDeleteButton
        canDelete={false}
        onDeletePress={onDeletePress}
      />,
    );

    const delBtn = screen.getByTestId('delete-button');

    const isDisabled =
      (delBtn as any).props?.accessibilityState?.disabled ??
      (delBtn as any).props?.disabled ??
      false;

    expect(isDisabled).toBe(true);

    fireEvent.press(delBtn);
    expect(onDeletePress).not.toHaveBeenCalled();

    expect((delBtn as any).props?.accessibilityLabel).toMatch(/deshabilitado/i);
  });

  it('botón eliminar habilitado cuando canDelete=true, llama onDeletePress', () => {
    const onDeletePress = jest.fn();
    renderWithProviders(
      <BookListItem {...baseProps} showDeleteButton canDelete onDeletePress={onDeletePress} />,
    );

    const delBtn = screen.getByTestId('delete-button');

    const isDisabled =
      (delBtn as any).props?.accessibilityState?.disabled ??
      (delBtn as any).props?.disabled ??
      false;

    expect(isDisabled).toBe(false);

    fireEvent.press(delBtn);
    expect(onDeletePress).toHaveBeenCalledTimes(1);

    expect((delBtn as any).props?.accessibilityLabel).toMatch(/eliminar libro/i);
  });

  it('action button: muestra "Solicitar" habilitado y dispara onActionPress', () => {
    const onActionPress = jest.fn();
    renderWithProviders(
      <BookListItem
        {...baseProps}
        showActionButton
        actionStatus="Solicitar"
        onActionPress={onActionPress}
      />,
    );

    const actionLabel = screen.getByText(/^Solicitar$/i);
    fireEvent.press(actionLabel);
    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  it('action button: "Pendiente" sin custom label → deshabilitado (no dispara)', () => {
    const onActionPress = jest.fn();
    renderWithProviders(
      <BookListItem
        {...baseProps}
        showActionButton
        actionStatus="Pendiente"
        onActionPress={onActionPress}
      />,
    );

    const actionLabel = screen.getByText(/^Pendiente$/i);
    fireEvent.press(actionLabel);
    expect(onActionPress).not.toHaveBeenCalled();
  });

  it('renderiza ownerName, ownerRating (1 decimal) y distancia (2 decimales)', () => {
    renderWithProviders(
      <BookListItem {...baseProps} ownerName="Alice" ownerRating={4.5} distanceKm={1.234} />,
    );

    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('4.5')).toBeTruthy();
    expect(screen.getByText('1.23 km')).toBeTruthy();
  });
});
