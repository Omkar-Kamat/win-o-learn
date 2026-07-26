import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '../../utils/hackathonStatus';

export default function StatusBadge({ status }) {
 const map = {
 pending: { label: 'Pending', variant: 'warning' },
 approved: { label: 'Approved', variant: 'success' },
 rejected: { label: 'Rejected', variant: 'error' },
 under_review: { label: 'Under Review', variant: 'info' },
 ...STATUS_LABELS,
 };

 const config = map[status?.toLowerCase()] || { label: status, variant: 'default' };

 return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}
