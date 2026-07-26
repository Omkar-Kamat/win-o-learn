import Badge from '../ui/Badge';

export default function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'error' },
    under_review: { label: 'Under Review', variant: 'info' },
    ongoing: { label: 'Ongoing', variant: 'info' },
    draft: { label: 'Draft', variant: 'default' }
  };

  const config = map[status?.toLowerCase()] || { label: status, variant: 'default' };

  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}
