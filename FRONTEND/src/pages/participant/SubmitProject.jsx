import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const submissionSchema = z.object({
 projectName: z.string().min(3).max(100),
 problemStatement: z.string().max(5000),
 solutionDescription: z.string().max(10000),
 githubRepo: z.string().url().optional().or(z.literal('')),
 liveDemoUrl: z.string().url().optional().or(z.literal('')),
 techStack: z.string().optional()
});

export default function SubmitProject() {
 const { hackathonId, submissionId } = useParams();
 const navigate = useNavigate();
 const isEdit = Boolean(submissionId);
 const [fileData, setFileData] = useState({
 demoVideo: null,
 presentation: null,
 screenshots: []
 });

 const queryClient = useQueryClient();

 const { data: submission, isLoading } = useQuery({
 queryKey: ['submission', submissionId],
 queryFn: async () => {
 const res = await axiosClient.get(`/submissions/${submissionId}`);
 return res.data.data;
 },
 enabled: isEdit
 });

 const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
 resolver: zodResolver(submissionSchema),
 defaultValues: {
 projectName: '',
 problemStatement: '',
 solutionDescription: '',
 githubRepo: '',
 liveDemoUrl: '',
 techStack: ''
 }
 });

 useEffect(() => {
 if (submission) {
 reset({
 projectName: submission.projectName || '',
 problemStatement: submission.problemStatement || '',
 solutionDescription: submission.solutionDescription || '',
 githubRepo: submission.githubRepo || '',
 liveDemoUrl: submission.liveDemoUrl || '',
 techStack: submission.techStack?.join(', ') || ''
 });
 }
 }, [submission, reset]);

 const handleFileChange = (e, fieldName) => {
 if (fieldName === 'screenshots') {
 setFileData(prev => ({ ...prev, screenshots: Array.from(e.target.files) }));
 } else {
 setFileData(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
 }
 };

 const uploadFiles = async (subId) => {
 const hasFiles = fileData.demoVideo || fileData.presentation || fileData.screenshots.length > 0;
 if (!hasFiles) return;

 const formData = new FormData();
 if (fileData.demoVideo) formData.append('demoVideo', fileData.demoVideo);
 if (fileData.presentation) formData.append('presentation', fileData.presentation);
 fileData.screenshots.forEach(file => {
 formData.append('screenshots', file);
 });

 await axiosClient.put(`/submissions/${subId}/files`, formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 };

 const onSubmit = async (data) => {
 try {
 const payload = {
 ...data,
 techStack: data.techStack ? data.techStack.split(',').map(s => s.trim()).filter(Boolean) : []
 };

 let subId = submissionId;
 
 if (isEdit) {
 await axiosClient.put(`/submissions/${subId}`, payload);
 toast.success('Project updated successfully!');
 } else {
 const res = await axiosClient.post(`/hackathons/${hackathonId}/submissions`, payload);
 subId = res.data.data._id;
 toast.success('Project submitted successfully!');
 }

 await uploadFiles(subId);
 
 queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
 if (isEdit) queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
 
 navigate('/dashboard/participant/submissions');
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to save project');
 }
 };

 if (isEdit && isLoading) return <div className="text-center mt-10 text-muted-foreground">Loading submission...</div>;

 return (
 <div className="max-w-3xl mx-auto space-y-8 pb-12">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">{isEdit ? 'Edit Project Submission' : 'Submit Project'}</h1>
 <p className="text-muted-foreground mt-2">
 {isEdit ? `Updating submission for ${submission?.registration?.hackathon?.title || 'Hackathon'}` : `You are submitting for Hackathon ID: ${hackathonId}`}
 </p>
 </div>

 <Card className="p-6">
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 <div className="space-y-1"><Label>Project Name</Label><Input 
 placeholder="Awesome App"
 {...register('projectName')}
 error={errors.projectName?.message}
 /></div>

 <div className="flex flex-col gap-1 w-full">
 <label className="text-sm font-medium text-foreground">Problem Statement</label>
 <textarea
 className={`h-32 py-3 px-4 ] bg-card border ${errors.problemStatement ? 'border-error' : 'border-border'} text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none`}
 {...register('problemStatement')}
 placeholder="What problem does your project solve?"
 ></textarea>
 {errors.problemStatement && <span className="text-xs text-destructive">{errors.problemStatement.message}</span>}
 </div>

 <div className="flex flex-col gap-1 w-full">
 <label className="text-sm font-medium text-foreground">Solution Description</label>
 <textarea
 className={`h-48 py-3 px-4 ] bg-card border ${errors.solutionDescription ? 'border-error' : 'border-border'} text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none`}
 {...register('solutionDescription')}
 placeholder="How did you solve it? Briefly explain your architecture and approach."
 ></textarea>
 {errors.solutionDescription && <span className="text-xs text-destructive">{errors.solutionDescription.message}</span>}
 </div>

 <div>
 <div className="space-y-1"><Label>Tech Stack (comma separated)</Label><Input 
 placeholder="React, Node.js, MongoDB"
 {...register('techStack')}
 error={errors.techStack?.message}
 /></div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1"><Label>GitHub Repo URL</Label><Input 
 placeholder="https://github.com/..."
 {...register('githubRepo')}
 error={errors.githubRepo?.message}
 /></div>
 <div className="space-y-1"><Label>Live Demo URL</Label><Input 
 placeholder="https://..."
 {...register('liveDemoUrl')}
 error={errors.liveDemoUrl?.message}
 /></div>
 </div>

 <div className="space-y-4 pt-4 border-t border-border">
 <h3 className="font-medium text-foreground">Media & Files</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-medium text-foreground mb-1 block">Demo Video</label>
 <input 
 type="file" 
 accept="video/*" 
 onChange={(e) => handleFileChange(e, 'demoVideo')} 
 className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file: file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/10/80 cursor-pointer"
 />
 </div>
 <div>
 <label className="text-sm font-medium text-foreground mb-1 block">Presentation</label>
 <input 
 type="file" 
 accept=".pdf,.ppt,.pptx" 
 onChange={(e) => handleFileChange(e, 'presentation')} 
 className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file: file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/10/80 cursor-pointer"
 />
 </div>
 </div>
 <div>
 <label className="text-sm font-medium text-foreground mb-1 block">Screenshots (multiple)</label>
 <input 
 type="file" 
 accept="image/*" 
 multiple
 onChange={(e) => handleFileChange(e, 'screenshots')} 
 className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file: file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/10/80 cursor-pointer"
 />
 </div>
 </div>

 <div className="pt-6 flex justify-end gap-3 border-t border-border">
 <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
 <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Save Changes' : 'Submit Project'}</Button>
 </div>
 </form>
 </Card>
 </div>
 );
}
