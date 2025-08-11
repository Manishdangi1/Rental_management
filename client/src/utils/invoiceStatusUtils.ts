// Utility functions for handling invoice statuses

export const getInvoiceStatusColor = (status: string): string => {
  switch (status) {
    case 'FULLY_INVOICED':
      return 'success';
    case 'NOTHING_TO_INVOICE':
      return 'default';
    case 'TO_INVOICE':
      return 'warning';
    default:
      return 'default';
  }
};

export const getInvoiceStatusLabel = (status: string): string => {
  switch (status) {
    case 'FULLY_INVOICED':
      return 'Fully Invoiced';
    case 'NOTHING_TO_INVOICE':
      return 'Nothing to Invoice';
    case 'TO_INVOICE':
      return 'To Invoice';
    default:
      return status;
  }
};

export const getInvoiceStatusDescription = (status: string): string => {
  switch (status) {
    case 'FULLY_INVOICED':
      return 'All items in this rental have been invoiced and paid';
    case 'NOTHING_TO_INVOICE':
      return 'No items in this rental require invoicing';
    case 'TO_INVOICE':
      return 'This rental has items that need to be invoiced';
    default:
      return 'Unknown invoice status';
  }
};

export const canUpdateInvoiceStatus = (currentStatus: string, newStatus: string): boolean => {
  // Define valid status transitions
  const validTransitions: Record<string, string[]> = {
    'NOTHING_TO_INVOICE': ['TO_INVOICE'],
    'TO_INVOICE': ['FULLY_INVOICED', 'NOTHING_TO_INVOICE'],
    'FULLY_INVOICED': ['TO_INVOICE', 'NOTHING_TO_INVOICE']
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export const getNextInvoiceStatus = (currentStatus: string): string[] => {
  const validTransitions: Record<string, string[]> = {
    'NOTHING_TO_INVOICE': ['TO_INVOICE'],
    'TO_INVOICE': ['FULLY_INVOICED', 'NOTHING_TO_INVOICE'],
    'FULLY_INVOICED': ['TO_INVOICE', 'NOTHING_TO_INVOICE']
  };

  return validTransitions[currentStatus] || [];
}; 