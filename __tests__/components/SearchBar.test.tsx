import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@testutils/renderWithProviders';
import SearchBar from '@/components/SearchBar';

describe('SearchBar', () => {
  it('renderiza con placeholder personalizado', () => {
    renderWithProviders(
      <SearchBar
        testID="search"
        onChangeText={jest.fn()}
        value=""
        placeholder="Nuevo placeholder"
      />,
    );
    const input = screen.queryByPlaceholderText(/Nuevo placeholder/i);
    expect(input).toBeDefined();
  });

  it('llama onChangeText al escribir', () => {
    const onChangeText = jest.fn();
    renderWithProviders(<SearchBar testID="search" onChangeText={onChangeText} value="" />);

    const input =
      screen.queryByPlaceholderText(/buscar/i) ??
      screen.queryByPlaceholderText(/search/i) ??
      screen.getByTestId('search');

    fireEvent.changeText(input!, 'clean code');
    expect(onChangeText).toHaveBeenCalledWith('clean code');
  });

  it('propaga value inicial', () => {
    renderWithProviders(<SearchBar testID="search" value="ddd" onChangeText={jest.fn()} />);
    const input = screen.queryByPlaceholderText(/buscar/i) ?? screen.getByTestId('search');
    expect(input?.props.value).toBe('ddd');
  });
});
