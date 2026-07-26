import { Badge } from '@/components/ui/badge';

export default function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'error' },
    under_review: { label: 'Under Review', variant: 'info' },
    ongoing: { label: 'Ongoing', variant: 'info' },
    draft: { label: 'Draft', variant: 'default' },
    upcoming: { label: 'Upcoming', variant: 'default' },
    'registration-open': { label: 'Registration Open', variant: 'success' },
    closed: { label: 'Closed', variant: 'error' },
    'results-published': { label: 'Results Published', variant: 'success' }
  };

  const config = map[status?.toLowerCase()] || { label: status, variant: 'default' };

  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}
