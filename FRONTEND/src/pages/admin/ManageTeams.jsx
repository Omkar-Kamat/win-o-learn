import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function ManageTeams() {
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await axiosClient.get('/teams');
      return res.data.data;
    }
  });

  const teams = teamsData?.teams || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Global Teams</h1>
        <p className="text-muted-foreground mt-2">Read-only oversight of all teams.</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Team Name</th>
              <th className="px-6 py-4 font-semibold text-foreground">Members</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-muted-foreground">Loading teams...</td>
              </tr>
            )}
            {!isLoading && teams.map(t => (
              <tr key={t._id} className="border-b border-border hover:bg-muted/50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{t.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{t.members?.length || 0} members</td>
              </tr>
            ))}
            {!isLoading && teams.length === 0 && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-muted-foreground">No teams found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
