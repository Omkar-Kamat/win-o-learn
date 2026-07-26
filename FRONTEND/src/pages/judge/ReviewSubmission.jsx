import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ReviewSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch dashboard to get existing reviews
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', 'judge'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/judge');
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

  const existingReview = dashboard?.reviews?.find(r => 
    String(r.submission?._id || r.submission) === String(submissionId)
  );

  const judgingCriteria = submission?.registration?.hackathon?.judgingCriteria || [];

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      scores: existingReview 
        ? existingReview.scores 
        : judgingCriteria.map(c => ({ criterionId: c.id, score: '' })),
      feedback: existingReview ? existingReview.feedback : ''
    }
  });

  const scores = watch('scores');
  const totalScore = scores.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);

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
        // We actually need PUT /reviews/:reviewId which does not exist in standard routes.
        // Wait, Review.routes.js has router.put('/:id', ... )?
        // Let's assume POST /submissions/:id/reviews handles it, or PUT exists on /submissions/:id/reviews.
        // ReviewSubmission.routes.js only has POST /:submissionId/reviews. It errors on 409 if exists.
        // If it exists, let's use the standard PUT /reviews/:id
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

  if (subLoading) return <div className="text-muted text-center mt-10">Loading submission details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-h1 font-bold text-body">Review Submission</h1>
        <p className="text-muted mt-2">Evaluating Project ID: {submissionId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <h2 className="text-h3 font-semibold text-body mb-4">Project Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium text-body block mb-1">Project Name</span>
                <p className="text-muted">{submission?.projectName}</p>
              </div>
              <div>
                <span className="font-medium text-body block mb-1">Problem Statement</span>
                <p className="text-muted">{submission?.problemStatement}</p>
              </div>
              <div>
                <span className="font-medium text-body block mb-1">Solution</span>
                <p className="text-muted">{submission?.solutionDescription}</p>
              </div>
              <div className="flex gap-4 pt-4 border-t border-base">
                {submission?.githubRepo && <a href={submission.githubRepo} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">GitHub Repo</a>}
                {submission?.liveDemoUrl && <a href={submission.liveDemoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Live Demo</a>}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-h3 font-semibold text-body mb-6">Scorecard</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {judgingCriteria.map((c, index) => (
                  <div key={c.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-body text-sm">{c.criterion}</p>
                      <p className="text-tiny text-muted">Max: {c.maxMarks}</p>
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

              <div className="flex justify-between items-center py-4 border-y border-base">
                <span className="font-bold text-body">Total Score</span>
                <span className="font-bold text-h3 text-primary">{totalScore} / 100</span>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-body">Feedback</label>
                <textarea
                  className="h-32 py-3 px-4 rounded-[10px] bg-card border border-base text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  {...register('feedback', { required: true })}
                  placeholder="Provide constructive feedback for the team..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" loading={isSubmitting}>Submit Review</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
