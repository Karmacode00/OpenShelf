import React from 'react';
import { FlatList, Text } from 'react-native';

import AcceptedItem from './AcceptedItem';
import RejectedItem from './RejectedItem';
import RequestItem from './RequestItem';
import ReturnedItem from './ReturnedItem';

import { AppNotification } from '@/types/notifications';

type Props = {
  items: AppNotification[];
  onMarkRead: (id: string) => void;
  onAcceptRequest: (bookId: string, notificationId: string) => void;
  onRejectRequest: (bookId: string, notificationId: string) => void;
  onRateUser: (borrowerId: string, borrowerName: string) => void;
};

export default function NotificationList({
  items,
  onMarkRead,
  onAcceptRequest,
  onRejectRequest,
  onRateUser,
}: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ gap: 12, paddingTop: 16 }}
      renderItem={({ item }) => {
        switch (item.type) {
          case 'solicitud':
            return (
              <RequestItem item={item} onAccept={onAcceptRequest} onReject={onRejectRequest} />
            );
          case 'aceptado':
            return <AcceptedItem item={item} onMarkRead={onMarkRead} />;
          case 'rechazado':
            return <RejectedItem item={item} onMarkRead={onMarkRead} />;
          case 'devuelto':
            return <ReturnedItem item={item} onMarkRead={onMarkRead} onRateUser={onRateUser} />;
          default:
            return null;
        }
      }}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 24 }}>No tienes notificaciones.</Text>
      }
    />
  );
}
