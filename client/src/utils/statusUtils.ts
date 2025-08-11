// Utility functions for handling rental statuses

export const formatStatusForDisplay = (status: string): string => {
  // Convert database status to user-friendly display text
  switch (status) {
    case 'QUOTATION':
      return 'Quotation';
    case 'QUOTATION_SENT':
      return 'Quotation Sent';
    case 'PICKED_UP':
      return 'Picked Up';
    case 'RETURNED':
      return 'Returned';
    case 'RESERVED':
      return 'Reserved';
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'OVERDUE':
      return 'Overdue';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
};

export const getStatusColor = (status: string): string => {
  // Return appropriate color for status display
  switch (status) {
    case 'QUOTATION':
    case 'QUOTATION_SENT':
      return 'info';
    case 'PICKED_UP':
    case 'IN_PROGRESS':
      return 'warning';
    case 'CONFIRMED':
    case 'RESERVED':
      return 'primary';
    case 'COMPLETED':
    case 'RETURNED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'OVERDUE':
      return 'error';
    case 'PENDING':
      return 'default';
    default:
      return 'default';
  }
};

export const getStatusCountByDisplayName = (rentals: any[], status: string): number => {
  return rentals.filter(rental => rental.status === status).length;
}; 