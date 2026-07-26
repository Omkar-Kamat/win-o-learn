import Card from '../../components/ui/Card';

export default function PlatformAnalytics() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">Platform Analytics</h1>
        <p className="text-muted mt-2">Charts and metrics.</p>
      </div>

      <Card className="h-64 flex items-center justify-center">
        <p className="text-muted">Recharts chart will go here.</p>
      </Card>
    </div>
  );
}
