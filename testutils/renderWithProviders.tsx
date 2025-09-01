import { render } from '@testing-library/react-native';
import React, { PropsWithChildren } from 'react';

import { AuthContext } from '@/contexts/AuthContext';
import { FeedbackContext } from '@/contexts/FeedbackContext';

const defaultAuth = {
  user: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
};

const defaultFeedback = {
  show: jest.fn(),
  hide: jest.fn(),
  state: { visible: false, type: null as any, message: '' },
};

export function renderWithProviders(
  ui: React.ReactElement,
  opts?: {
    auth?: Partial<typeof defaultAuth>;
    feedback?: Partial<typeof defaultFeedback>;
  },
) {
  const authValue = { ...defaultAuth, ...(opts?.auth ?? {}) };
  const feedbackValue = { ...defaultFeedback, ...(opts?.feedback ?? {}) };

  const Wrapper = ({ children }: PropsWithChildren) => (
    <AuthContext.Provider value={authValue as any}>
      <FeedbackContext.Provider value={feedbackValue as any}>{children}</FeedbackContext.Provider>
    </AuthContext.Provider>
  );

  return render(ui, { wrapper: Wrapper });
}
