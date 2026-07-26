import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ManageUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosClient.get('/users');
      return res.data.data;
    }
  });

  const handleToggleBlock = async (user) => {
    try {
      if (user.isBlocked) {
        await axiosClient.patch(`/users/${user._id}/unblock`);
        toast.success('User unblocked');
      } else {
        await axiosClient.patch(`/users/${user._id}/block`);
        toast.success('User blocked');
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const users = data?.users || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">Manage Users</h1>
        <p className="text-muted mt-2">View and manage platform users.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-base">
            <tr>
              <th className="px-6 py-4 font-semibold text-body">User</th>
              <th className="px-6 py-4 font-semibold text-body">Role</th>
              <th className="px-6 py-4 font-semibold text-body">Status</th>
              <th className="px-6 py-4 font-semibold text-body text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted">Loading users...</td>
              </tr>
            )}
            {!isLoading && users.map(u => (
              <tr key={u._id} className="border-b border-base last:border-0 hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-body">{u.name}</div>
                  <div className="text-muted text-xs">{u.email}</div>
                </td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full font-medium text-tiny ${u.isBlocked ? 'badge-error' : 'badge-success'}`}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button variant="secondary" size="sm">Edit Role</Button>
                  {u.isBlocked ? (
                    <Button variant="secondary" size="sm" onClick={() => handleToggleBlock(u)}>Unblock</Button>
                  ) : (
                    <Button variant="danger" size="sm" onClick={() => handleToggleBlock(u)}>Block</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
