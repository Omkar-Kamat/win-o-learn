import Card from '../ui/Card';

export default function StatCard({ label, value, icon: Icon, valueColor = 'text-body' }) {
  return (
    <Card padding="md" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-muted">{label}</div>
        {Icon && <Icon className="w-5 h-5 text-muted" />}
      </div>
      <div className={`text-h2 font-bold ${valueColor}`}>{value}</div>
    </Card>
  );
}
