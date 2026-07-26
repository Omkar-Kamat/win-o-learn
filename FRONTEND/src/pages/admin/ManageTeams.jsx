import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function ManageTeams() {
 const [searchTerm, setSearchTerm] = useState('');
 const [sortOrder, setSortOrder] = useState('asc'); // asc: A-Z, desc: Z-A, members_desc: Most Members

 const { ref, inView } = useInView();

 const { 
 data, 
 isLoading, 
 fetchNextPage,
 hasNextPage,
 isFetchingNextPage
 } = useInfiniteQuery({
 queryKey: ['teams', searchTerm],
 queryFn: async ({ pageParam = 1 }) => {
 const res = await axiosClient.get('/teams', {
 params: {
 page: pageParam,
 limit: 20,
 search: searchTerm || undefined
 }
 });
 return res.data.data;
 },
 getNextPageParam: (lastPage, allPages) => {
 if (lastPage.teams.length < 20) return undefined;
 return allPages.length + 1;
 }
 });

 useEffect(() => {
 if (inView && hasNextPage && !isFetchingNextPage) {
 fetchNextPage();
 }
 }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

 const teams = useMemo(() => {
 const all = data?.pages.flatMap(page => page.teams) || [];
 return Array.from(new Map(all.map(t => [t._id, t])).values());
 }, [data]);

 const filteredTeams = teams
 .sort((a, b) => {
 if (sortOrder === 'asc') return (a.name || '').localeCompare(b.name || '');
 if (sortOrder === 'desc') return (b.name || '').localeCompare(a.name || '');
 if (sortOrder === 'members_desc') return (b.members?.length || 0) - (a.members?.length || 0);
 return 0;
 });

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Global Teams</h1>
 <p className="text-muted-foreground mt-2">Read-only oversight of all teams.</p>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
 <input
 type="text"
 placeholder="Search team name..."
 className="px-3 py-2 border border-input bg-background text-sm"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 />
 <select 
 className="px-3 py-2 border border-input bg-background text-sm"
 value={sortOrder}
 onChange={e => setSortOrder(e.target.value)}
 >
 <option value="asc">Name (A-Z)</option>
 <option value="desc">Name (Z-A)</option>
 <option value="members_desc">Most Members</option>
 </select>
 </div>
 </div>

 <Card className="overflow-hidden">
 <table className="w-full text-left text-sm">
 <thead className="bg-muted/50 border-b border-border">
 <tr>
 <th className="px-6 py-4 font-semibold text-foreground">Team Name</th>
 <th className="px-6 py-4 font-semibold text-foreground text-right">Members</th>
 </tr>
 </thead>
 <tbody>
 {isLoading && (
 <tr>
 <td colSpan="2" className="px-6 py-8 text-center text-muted-foreground">Loading teams...</td>
 </tr>
 )}
 {!isLoading && filteredTeams.map(t => (
 <tr key={t._id} className="border-b border-border hover:bg-muted/50/50 transition-colors">
 <td className="px-6 py-4 font-medium text-foreground">{t.name}</td>
 <td className="px-6 py-4 text-muted-foreground text-right">{t.members?.length || 0} members</td>
 </tr>
 ))}
 {!isLoading && filteredTeams.length === 0 && (
 <tr>
 <td colSpan="2" className="px-6 py-8 text-center text-muted-foreground">No teams found.</td>
 </tr>
 )}
 {isFetchingNextPage && (
 <tr>
 <td colSpan="2" className="px-6 py-8 text-center text-muted-foreground">Loading more teams...</td>
 </tr>
 )}
 <tr ref={ref}>
 <td colSpan="2" className="h-1 p-0 m-0"></td>
 </tr>
 </tbody>
 </table>
 </Card>
 </div>
 );
}
