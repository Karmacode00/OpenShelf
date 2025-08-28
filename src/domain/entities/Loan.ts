export type LoanStatus = 'requested' | 'rejected' | 'cancelled' | 'loaned' | 'returned';

export type Loan = {
  id: string;
  bookId: string;
  ownerId: string;
  borrowerId: string;
  status: LoanStatus;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  requestedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  loanedAt?: Date;
  returnedAt?: Date;
  dueDate?: Date;
};
