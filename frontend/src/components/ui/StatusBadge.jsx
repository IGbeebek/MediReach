import Badge from './Badge';

const statusVariant = {
  Pending: 'amber',
  Verified: 'primary',
  Packed: 'primary',
  Shipped: 'primary',
  Delivered: 'success',
  Approved: 'success',
  Rejected: 'soft-red',
};

export default function StatusBadge({ status }) {
  const variant = statusVariant[status] || 'default';
  return <Badge variant={variant}>{status}</Badge>;
}
