import { useSearchParams } from 'react-router-dom';
import HackathonCard from '../../components/hackathon/HackathonCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';

export default function Listing() {
 const [searchParams, setSearchParams] = useSearchParams();
 const search = searchParams.get('search') || '';
 const mode = searchParams.get('mode') || '';
 const status = searchParams.get('status') || '';

 const { data: hackathons, isLoading, error } = useQuery({
 queryKey: ['hackathons', search, mode, status],
 queryFn: async () => {
 const params = new URLSearchParams();
 if (search) params.append('search', search);
 if (mode) params.append('mode', mode);
 if (status) params.append('status', status);
 
 const res = await axiosClient.get(`/hackathons?${params.toString()}`);
 return res.data.data.hackathons;
 }
 });

 const updateParam = (key, value) => {
 const newParams = new URLSearchParams(searchParams);
 if (value) {
 newParams.set(key, value);
 } else {
 newParams.delete(key);
 }
 setSearchParams(newParams);
 };

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Browse Hackathons</h1>
 <p className="text-muted-foreground mt-2">Find your next challenge.</p>
 </div>
 
 <div className="flex flex-wrap gap-4">
 <div className="w-full md:w-1/3">
 <Input 
 placeholder="Search hackathons..." 
 value={search}
 onChange={(e) => updateParam('search', e.target.value)}
 />
 </div>
 <div className="w-full md:w-1/4">
 <select className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={mode} onChange={(e) => updateParam('mode', e.target.value)}>
 <option value="">All Modes</option>
 <option value="online">Online</option>
 <option value="offline">Offline</option>
 </select>
 </div>
 <div className="w-full md:w-1/4">
 <select className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={status} onChange={(e) => updateParam('status', e.target.value)}>
 <option value="">All Statuses</option>
 <option value="upcoming">Upcoming</option>
 <option value="ongoing">Ongoing</option>
 <option value="completed">Closed</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {isLoading && <p className="text-muted-foreground col-span-full">Loading hackathons...</p>}
 {error && <p className="text-destructive col-span-full">Failed to load hackathons.</p>}
 {!isLoading && hackathons?.length === 0 && <p className="text-muted-foreground col-span-full">No hackathons found matching your criteria.</p>}
 {hackathons?.map(h => <HackathonCard key={h._id} hackathon={h} />)}
 </div>
 </div>
 );
}
