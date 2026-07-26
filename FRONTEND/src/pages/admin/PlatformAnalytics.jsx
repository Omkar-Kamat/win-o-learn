import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlatformAnalytics() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/admin');
      return res.data.data;
    }
  });

  const growthData = dashboard?.platformGrowth || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground mt-2">Charts and metrics over time.</p>
      </div>

      <Card className="h-96 w-full p-6">
        <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-6">User Growth</h2>
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">Loading chart data...</div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-destructive">Failed to load chart data.</div>
        ) : growthData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">No growth data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base)" />
              <XAxis dataKey="month" stroke="var(--color-muted)" />
              <YAxis stroke="var(--color-muted)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-base)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-body)' }}
              />
              <Line type="monotone" dataKey="users" stroke="var(--color-primary)" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
