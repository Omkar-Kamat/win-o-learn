import { useState } from 'react';
import toast from 'react-hot-toast';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect, useMemo } from 'react';
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
} from"../../components/ui/dialog";

export default function ManageUsers() {
 const queryClient = useQueryClient();
 const [selectedUser, setSelectedUser] = useState(null);
 const [newRole, setNewRole] = useState('');
 
 const [searchTerm, setSearchTerm] = useState('');
 const [roleFilter, setRoleFilter] = useState('all');
 const [sortOrder, setSortOrder] = useState('asc');

 const { ref, inView } = useInView();
 
 const { 
 data, 
 isLoading, 
 error,
 fetchNextPage,
 hasNextPage,
 isFetchingNextPage
 } = useInfiniteQuery({
 queryKey: ['users', roleFilter, searchTerm],
 queryFn: async ({ pageParam = 1 }) => {
 const res = await axiosClient.get('/users', {
 params: {
 page: pageParam,
 limit: 20,
 role: roleFilter === 'all' ? undefined : roleFilter,
 search: searchTerm || undefined
 }
 });
 return res.data.data; // { users, total }
 },
 getNextPageParam: (lastPage, allPages) => {
 // If we got less than 20 items, there are no more pages
 if (lastPage.users.length < 20) return undefined;
 return allPages.length + 1;
 }
 });

 useEffect(() => {
 if (inView && hasNextPage && !isFetchingNextPage) {
 fetchNextPage();
 }
 }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

 const users = useMemo(() => {
 const allUsers = data?.pages.flatMap(page => page.users) || [];
 // Deduplicate by _id to prevent React key warnings when items shift during pagination
 return Array.from(new Map(allUsers.map(u => [u._id, u])).values());
 }, [data]);

 // Frontend sorting only (since backend doesn't support sort parameter yet)
 const sortedUsers = [...users].sort((a, b) => {
 return sortOrder === 'asc' 
 ? a.name.localeCompare(b.name) 
 : b.name.localeCompare(a.name);
 });

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Manage Users</h1>
 <p className="text-muted-foreground mt-2">View and manage platform users.</p>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
 <input
 type="text"
 placeholder="Search name or email..."
 className="px-3 py-2 border border-input bg-background text-sm"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 />
 <select 
 className="px-3 py-2 border border-input bg-background text-sm"
 value={roleFilter}
 onChange={e => setRoleFilter(e.target.value)}
 >
 <option value="all">All Roles</option>
 <option value="participant">Participant</option>
 <option value="organizer">Organizer</option>
 <option value="judge">Judge</option>
 <option value="admin">Admin</option>
 </select>
 <select 
 className="px-3 py-2 border border-input bg-background text-sm"
 value={sortOrder}
 onChange={e => setSortOrder(e.target.value)}
 >
 <option value="asc">Sort A-Z</option>
 <option value="desc">Sort Z-A</option>
 </select>
 </div>
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
 className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
 {!isLoading && sortedUsers.map(u => (
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
 {!isLoading && sortedUsers.length === 0 && (
 <tr>
 <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
 </tr>
 )}
 {isFetchingNextPage && (
 <tr>
 <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading more users...</td>
 </tr>
 )}
 <tr ref={ref}>
 <td colSpan="4" className="h-1 p-0 m-0"></td>
 </tr>
 </tbody>
 </table>
 </Card>
 </div>
 );
}
