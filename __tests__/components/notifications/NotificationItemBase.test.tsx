import React from 'react';
import { View, Text } from 'react-native';
import { render } from '@testing-library/react-native';

import NotificationItemBase from '@/components/notifications/NotificationItemBase';

describe('NotificationItemBase', () => {
  it('aplica background y NO borde si unread=false', () => {
    const { UNSAFE_getByType } = render(
      <NotificationItemBase unread={false}>
        <View />
      </NotificationItemBase>,
    );
    const root = UNSAFE_getByType(View);
    const style = Object.assign(
      {},
      ...(Array.isArray(root.props.style) ? root.props.style : [root.props.style]),
    );
    expect(style.backgroundColor).toBe('cardColor');
    expect(style.borderWidth).toBeUndefined();
    expect(style.borderColor).toBeUndefined();
  });

  it('aplica borde cuando unread=true', () => {
    const { UNSAFE_getByType } = render(
      <NotificationItemBase unread>
        <View />
      </NotificationItemBase>,
    );
    const root = UNSAFE_getByType(View);
    const style = Object.assign(
      {},
      ...(Array.isArray(root.props.style) ? root.props.style : [root.props.style]),
    );
    expect(style.backgroundColor).toBe('cardColor');
    expect(style.borderWidth).toBe(1.5);
    expect(style.borderColor).toBe('tintColor');
  });
});
