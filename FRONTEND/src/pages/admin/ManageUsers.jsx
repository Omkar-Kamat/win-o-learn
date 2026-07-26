import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

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

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const res = await axiosClient.patch(`/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Role updated successfully');
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  });

  const handleUpdateRole = (e) => {
    e.preventDefault();
    if (!selectedUser || !newRole) return;
    updateRoleMutation.mutate({ userId: selectedUser._id, role: newRole });
  };

  const users = data?.users || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Manage Users</h1>
        <p className="text-muted-foreground mt-2">View and manage platform users.</p>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role for {selectedUser?.name}</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="participant">Participant</option>
                <option value="organizer">Organizer</option>
                <option value="judge">Judge</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSelectedUser(null)}>Cancel</Button>
              <Button type="submit" disabled={updateRoleMutation.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">User</th>
              <th className="px-6 py-4 font-semibold text-foreground">Role</th>
              <th className="px-6 py-4 font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading users...</td>
              </tr>
            )}
            {!isLoading && users.map(u => (
              <tr key={u._id} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{u.name}</div>
                  <div className="text-muted-foreground text-xs">{u.email}</div>
                </td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                  <Badge variant={u.isBlocked ? 'error' : 'success'}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setSelectedUser(u);
                      setNewRole(u.role);
                    }}
                  >
                    Edit Role
                  </Button>
                  {u.isBlocked ? (
                    <Button variant="secondary" size="sm" onClick={() => handleToggleBlock(u)}>Unblock</Button>
                  ) : (
                    <Button variant="destructive" size="sm" onClick={() => handleToggleBlock(u)}>Block</Button>
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
