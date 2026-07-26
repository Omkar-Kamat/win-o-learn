import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ReviewSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch dashboard to get existing reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['judge', 'my-reviews'],
    queryFn: async () => {
      const res = await axiosClient.get('/judges/me/reviews');
      return res.data.data;
    }
  });

  // Fetch submission details to get judging criteria and info
  const { data: submission, isLoading: subLoading } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: async () => {
      const res = await axiosClient.get(`/submissions/${submissionId}`);
      return res.data.data;
    }
  });

  const existingReview = reviews.find(r =>
    String(r.submission?._id || r.submission) === String(submissionId)
  );

  const judgingCriteria = submission?.registration?.hackathon?.judgingCriteria || [];

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      scores: existingReview
        ? existingReview.scores
        : judgingCriteria.map(c => ({ criterionId: c.criterion, score: '' })),
      feedback: existingReview ? existingReview.feedback : ''
    }
  });

  const scores = watch('scores');
  const totalScore = scores.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
  const maxTotalScore = judgingCriteria.reduce((acc, c) => acc + (c.maxMarks || 0), 0);

  const onSubmit = async (data) => {
    // Map scores to what the backend expects (the array of { criterion, score })
    const formattedData = {
      feedback: data.feedback,
      scores: judgingCriteria.map((c, index) => ({
        criterion: c.criterion,
        score: Number(data.scores[index]?.score) || 0
      }))
    };

    try {
      if (existingReview) {
        await axiosClient.put(`/reviews/${existingReview._id}`, formattedData);
      } else {
        await axiosClient.post(`/submissions/${submissionId}/reviews`, formattedData);
      }
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'judge'] });
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (subLoading) return <div className="text-muted-foreground text-center mt-10">Loading submission details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Review Submission</h1>
        <p className="text-muted-foreground mt-2">Evaluating Project ID: {submissionId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-4">Project Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium text-foreground block mb-1">Project Name</span>
                <p className="text-muted-foreground">{submission?.projectName}</p>
              </div>
              <div>
                <span className="font-medium text-foreground block mb-1">Problem Statement</span>
                <p className="text-muted-foreground">{submission?.problemStatement}</p>
              </div>
              <div>
                <span className="font-medium text-foreground block mb-1">Solution</span>
                <p className="text-muted-foreground">{submission?.solutionDescription}</p>
              </div>
              <div className="flex gap-4 pt-4 border-t border-border">
                {submission?.githubRepo && <a href={submission.githubRepo} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">GitHub Repo</a>}
                {submission?.liveDemoUrl && <a href={submission.liveDemoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Live Demo</a>}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-6">Scorecard</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {judgingCriteria.map((c, index) => (
                  <div key={c.criterion} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{c.criterion}</p>
                      <p className="text-xs text-muted-foreground">Max: {c.maxMarks}</p>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max={c.maxMarks}
                        placeholder="Score"
                        {...register(`scores.${index}.score`, { required: true, max: c.maxMarks, min: 0 })}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-4 border-y border-border">
                <span className="font-bold text-foreground">Total Score</span>
                <span className="font-bold text-2xl font-semibold tracking-tight text-primary">{totalScore} / {maxTotalScore}</span>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-foreground">Feedback</label>
                <textarea
                  className="h-32 py-3 px-4 rounded-[10px] bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  {...register('feedback', { required: true })}
                  placeholder="Provide constructive feedback for the team..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Submit Review</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
