import React from 'react';
import { FlatList, Text } from 'react-native';

import AcceptedItem from './AcceptedItem';
import RejectedItem from './RejectedItem';
import RequestItem from './RequestItem';
import ReturnedItem from './ReturnedItem';

import { AppNotification, NotifDevueltoBorrower } from '@/types/notifications';
import ConfirmReturnItem from './ConfirmReturnItem';

type Props = {
  items: AppNotification[];
  onMarkRead?: (id: string) => void;
  onAcceptRequest: (bookId: string, notificationId: string) => void;
  onRejectRequest: (bookId: string, notificationId: string) => void;
  onRateUser: (borrowerId: string, borrowerName: string, notificationId: string) => void;
  onConfirmReturn: (bookId: string, notificationId: string, confirmation: boolean) => void;
  onRateOwner: (ownerId: string, ownerName: string, notificationId: string) => void;
};

export default function NotificationList({
  items,
  onMarkRead,
  onAcceptRequest,
  onRejectRequest,
  onRateUser,
  onConfirmReturn,
  onRateOwner,
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
          case 'rechaza_devolucion':
          case 'rechazado':
            return <RejectedItem item={item} />;
          case 'devuelto':
            return (
              <ReturnedItem
                item={item}
                onRateUser={(borrowerId, borrowerName) =>
                  onRateUser(borrowerId, borrowerName, item.id)
                }
              />
            );
          case 'confirma_devolucion': {
            return (
              <ConfirmReturnItem
                item={item}
                onConfirmReturn={(bookId, notifId, confirmed) =>
                  onConfirmReturn(bookId, notifId, confirmed)
                }
              />
            );
          }
          case 'devuelto_borrower': {
            return (
              <ReturnedItem
                item={item}
                resolveTarget={(x: NotifDevueltoBorrower) => ({
                  id: x.data.ownerId,
                  name: x.data.ownerName,
                })}
                onRateUser={(ownerId, ownerName) => onRateOwner(ownerId, ownerName, item.id)}
              />
            );
          }
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
