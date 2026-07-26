import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ManageHackathons() {
 const queryClient = useQueryClient();

 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');
 const [sortOrder, setSortOrder] = useState('asc');

 const { ref, inView } = useInView();

 const { 
 data, 
 isLoading, 
 fetchNextPage,
 hasNextPage,
 isFetchingNextPage
 } = useInfiniteQuery({
 queryKey: ['hackathons', statusFilter, searchTerm],
 queryFn: async ({ pageParam = 1 }) => {
 const res = await axiosClient.get('/hackathons', {
 params: {
 page: pageParam,
 limit: 20,
 status: statusFilter === 'all' ? undefined : statusFilter,
 search: searchTerm || undefined
 }
 });
 return res.data.data;
 },
 getNextPageParam: (lastPage, allPages) => {
 if (lastPage.hackathons.length < 20) return undefined;
 return allPages.length + 1;
 }
 });

 useEffect(() => {
 if (inView && hasNextPage && !isFetchingNextPage) {
 fetchNextPage();
 }
 }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

 const handleDelete = async (id) => {
 if (!window.confirm('Are you sure you want to delete this hackathon?')) return;
 try {
 await axiosClient.delete(`/hackathons/${id}`);
 toast.success('Hackathon deleted');
 queryClient.invalidateQueries({ queryKey: ['hackathons'] });
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to delete hackathon');
 }
 };

 const hackathons = useMemo(() => {
 const all = data?.pages.flatMap(page => page.hackathons) || [];
 return Array.from(new Map(all.map(h => [h._id, h])).values());
 }, [data]);

 const filteredHackathons = hackathons
 .sort((a, b) => {
 return sortOrder === 'asc' 
 ? (a.title || '').localeCompare(b.title || '')
 : (b.title || '').localeCompare(a.title || '');
 });

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Global Hackathons</h1>
 <p className="text-muted-foreground mt-2">Oversight of all hackathons on the platform.</p>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
 <input
 type="text"
 placeholder="Search title or organizer..."
 className="px-3 py-2 border border-input bg-background text-sm"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 />
 <select 
 className="px-3 py-2 border border-input bg-background text-sm"
 value={statusFilter}
 onChange={e => setStatusFilter(e.target.value)}
 >
 <option value="all">All Statuses</option>
 <option value="draft">Draft</option>
 <option value="published">Published</option>
 <option value="completed">Completed</option>
 <option value="active">Active</option>
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

 <Card className="overflow-hidden">
 <table className="w-full text-left text-sm">
 <thead className="bg-muted/50 border-b border-border">
 <tr>
 <th className="px-6 py-4 font-semibold text-foreground">Title</th>
 <th className="px-6 py-4 font-semibold text-foreground">Organizer</th>
 <th className="px-6 py-4 font-semibold text-foreground">Status</th>
 <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {isLoading && (
 <tr>
 <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading hackathons...</td>
 </tr>
 )}
 {!isLoading && filteredHackathons.map(h => (
 <tr key={h._id} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
 <td className="px-6 py-4 font-medium text-foreground">{h.title}</td>
 <td className="px-6 py-4 text-muted-foreground">{h.organizer?.name || h.organizer || 'Unknown'}</td>
 <td className="px-6 py-4"><Badge variant="info" className="capitalize">{h.status || 'active'}</Badge></td>
 <td className="px-6 py-4 text-right">
 <Button variant="destructive" size="sm" onClick={() => handleDelete(h._id)}>Delete</Button>
 </td>
 </tr>
 ))}
 {!isLoading && filteredHackathons.length === 0 && (
 <tr>
 <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No hackathons found.</td>
 </tr>
 )}
 {isFetchingNextPage && (
 <tr>
 <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading more hackathons...</td>
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
