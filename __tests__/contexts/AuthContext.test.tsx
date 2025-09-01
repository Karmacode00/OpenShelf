import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';

jest.mock('@/viewmodels/useAuthViewModel', () => {
  const mockAuthState = {
    user: null as null | { uid: string },
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
  };
  return {
    __esModule: true,
    useAuthViewModel: () => mockAuthState,
    __setMockAuth: (next: Partial<typeof mockAuthState>) => {
      mockAuthState.user = (next.user ?? null) as any;
      mockAuthState.loading = !!next.loading;
      mockAuthState.login = (next.login ?? jest.fn()) as any;
      mockAuthState.logout = (next.logout ?? jest.fn()) as any;
    },
  };
});

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const muteReactErrorOnce = () => jest.spyOn(console, 'error').mockImplementation(() => {});

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useAuth fuera del provider → lanza error', () => {
    const spy = muteReactErrorOnce();

    const BadConsumer = () => {
      useAuth();
      return null;
    };

    expect(() => render(<BadConsumer />)).toThrow(/debe usarse dentro de un AuthProvider/i);
    spy.mockRestore();
  });

  it('AuthProvider entrega el valor del viewmodel (mock) y expone métodos', () => {
    const { __setMockAuth } = require('@/viewmodels/useAuthViewModel') as {
      __setMockAuth: (v: any) => void;
    };

    const login = jest.fn();
    const logout = jest.fn();
    __setMockAuth({ user: { uid: 'u1' }, loading: false, login, logout });

    const Consumer = () => {
      const { user, loading, login: doLogin, logout: doLogout } = useAuth();
      return (
        <View>
          <Text testID="uid">{user?.uid ?? 'no-user'}</Text>
          <Text testID="loading">{String(loading)}</Text>
          <Pressable testID="login" onPress={() => doLogin('email@email.com', 'somepassword')} />
          <Pressable testID="logout" onPress={() => doLogout()} />
        </View>
      );
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('uid').props.children).toBe('u1');
    expect(screen.getByTestId('loading').props.children).toBe('false');

    fireEvent.press(screen.getByTestId('login'));
    expect(login).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId('logout'));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
