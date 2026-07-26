import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function StatCard({ label, value, icon: Icon, valueColor = 'text-foreground' }) {
  return (
    <Card padding="md" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
      </div>
      <div className={`text-3xl font-semibold tracking-tight font-bold ${valueColor}`}>{value}</div>
    </Card>
  );
}
