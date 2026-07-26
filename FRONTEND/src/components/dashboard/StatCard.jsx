import { Card } from '@/components/ui/card';

export default function StatCard({ label, value, icon: Icon, valueColor = 'text-foreground' }) {
 return (
 <Card className="flex flex-col h-full p-6">
 <div className="flex flex-row items-center justify-between mb-2">
 <div className="text-sm font-medium text-muted-foreground">{label}</div>
 {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
 </div>
 <div className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</div>
 </Card>
 );
}
