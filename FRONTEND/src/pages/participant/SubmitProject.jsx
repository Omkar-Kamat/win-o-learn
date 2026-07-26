import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const submissionSchema = z.object({
  projectName: z.string().min(3).max(100),
  problemStatement: z.string().max(5000),
  solutionDescription: z.string().max(10000),
  githubRepo: z.string().url().optional().or(z.literal('')),
  liveDemoUrl: z.string().url().optional().or(z.literal('')),
});

export default function SubmitProject() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(submissionSchema)
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data) => {
    try {
      await axiosClient.post(`/hackathons/${hackathonId}/submissions`, data);
      toast.success('Project submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
      navigate('/dashboard/participant/submissions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit project');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-body">Submit Project</h1>
        <p className="text-muted mt-2">You are submitting for Hackathon ID: {hackathonId}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Project Name"
            placeholder="Awesome App"
            {...register('projectName')}
            error={errors.projectName?.message}
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-body">Problem Statement</label>
            <textarea
              className={`h-32 py-3 px-4 rounded-[10px] bg-card border ${errors.problemStatement ? 'border-error' : 'border-base'} text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none`}
              {...register('problemStatement')}
              placeholder="What problem does your project solve?"
            ></textarea>
            {errors.problemStatement && <span className="text-tiny text-error">{errors.problemStatement.message}</span>}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-body">Solution Description</label>
            <textarea
              className={`h-48 py-3 px-4 rounded-[10px] bg-card border ${errors.solutionDescription ? 'border-error' : 'border-base'} text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none`}
              {...register('solutionDescription')}
              placeholder="How did you solve it? Briefly explain your architecture and approach."
            ></textarea>
            {errors.solutionDescription && <span className="text-tiny text-error">{errors.solutionDescription.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="GitHub Repo URL"
              placeholder="https://github.com/..."
              {...register('githubRepo')}
              error={errors.githubRepo?.message}
            />
            <Input
              label="Live Demo URL"
              placeholder="https://..."
              {...register('liveDemoUrl')}
              error={errors.liveDemoUrl?.message}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-base">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Submit Project</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
