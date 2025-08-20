export type NotificationBase = {
  id: string;
  type: 'solicitud' | 'aceptado' | 'rechazado' | 'devuelto';
  unread: boolean;
  createdAt?: any;
  title: string;
  body: string;
};

export type NotifSolicitud = NotificationBase & {
  type: 'solicitud';
  data: {
    userName: string;
    bookTitle: string;
    borrowerId: string;
    bookId: string;
  };
};

export type NotifAceptado = NotificationBase & {
  type: 'aceptado';
  data: {
    ownerName: string;
    ownerEmail: string;
    bookTitle: string;
    bookId: string;
  };
};

export type NotifRechazado = NotificationBase & {
  type: 'rechazado';
  data: {
    bookTitle: string;
    bookId: string;
  };
};

export type NotifDevuelto = NotificationBase & {
  type: 'devuelto';
  data: {
    userName: string;
    bookTitle: string;
    borrowerId: string;
    bookId: string;
  };
};

export type AppNotification = NotifSolicitud | NotifAceptado | NotifRechazado | NotifDevuelto;
