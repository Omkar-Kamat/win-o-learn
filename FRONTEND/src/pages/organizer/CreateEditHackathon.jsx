import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { HACKATHON_MODE } from '../../utils/constants';

const hackathonSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(5000),
  theme: z.string().min(2).max(100),
  mode: z.enum([HACKATHON_MODE[0], HACKATHON_MODE[1]]),
  venue: z.string().optional(),
  registrationStartDate: z.string().min(1, 'Required'),
  registrationDeadline: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  submissionDeadline: z.string().min(1, 'Required'),
  prizePool: z.coerce.number().min(0),
  maxTeamSize: z.coerce.number().min(1).max(10),
  rules: z.array(z.object({ value: z.string().max(200) })).max(20),
  judgingCriteria: z.array(z.object({ 
    criterion: z.string().min(1), 
    maxMarks: z.coerce.number().min(1).max(100) 
  })).min(1),
});

export default function CreateEditHackathon() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: hackathon, isLoading } = useQuery({
    queryKey: ['hackathon', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}`);
      return res.data.data;
    },
    enabled: isEdit,
  });

  const { register, control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      mode: 'online',
      rules: [{ value: '' }],
      judgingCriteria: [{ criterion: '', maxMarks: 10 }],
    }
  });

  useEffect(() => {
    if (hackathon) {
      const formatForInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');
      reset({
        title: hackathon.title,
        description: hackathon.description,
        theme: hackathon.theme,
        mode: hackathon.mode,
        venue: hackathon.venue || '',
        registrationStartDate: formatForInput(hackathon.registrationStartDate),
        registrationDeadline: formatForInput(hackathon.registrationDeadline),
        startDate: formatForInput(hackathon.startDate),
        endDate: formatForInput(hackathon.endDate),
        submissionDeadline: formatForInput(hackathon.submissionDeadline),
        prizePool: hackathon.prizePool,
        maxTeamSize: hackathon.maxTeamSize,
        rules: hackathon.rules?.length ? hackathon.rules.map(r => ({ value: r })) : [{ value: '' }],
        judgingCriteria: hackathon.judgingCriteria?.length ? hackathon.judgingCriteria : [{ criterion: '', maxMarks: 10 }]
      });
    }
  }, [hackathon, reset]);

  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules'
  });

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'judgingCriteria'
  });

  const mode = watch('mode');

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        registrationStartDate: new Date(data.registrationStartDate).toISOString(),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        submissionDeadline: new Date(data.submissionDeadline).toISOString(),
        rules: data.rules.map(r => r.value).filter(Boolean)
      };

      if (isEdit) {
        await axiosClient.put(`/hackathons/${id}`, payload);
        toast.success('Hackathon updated successfully!');
      } else {
        await axiosClient.post('/hackathons', payload);
        toast.success('Hackathon created successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['hackathons', 'my'] });
      navigate('/dashboard/organizer');
    } catch (error) {
      console.error("Hackathon creation error:", JSON.stringify(error.response?.data, null, 2));
      const firstError = error.response?.data?.errors?.[0];
      const validationMsg = firstError ? `${firstError.path || 'Field'}: ${firstError.msg}` : null;
      toast.error(validationMsg || error.response?.data?.message || 'Failed to save hackathon');
    }
  };

  if (isEdit && isLoading) return <div className="text-muted text-center mt-10">Loading hackathon...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-h1 font-bold text-body">{isEdit ? 'Edit Hackathon' : 'Create Hackathon'}</h1>
        <p className="text-muted mt-2">Set up the details for your event.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <h2 className="text-h3 font-semibold text-body mb-6">Basic Info</h2>
          <div className="space-y-4">
            <Input label="Title" {...register('title')} error={errors.title?.message} />
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-body">Description</label>
              <textarea
                className={`h-32 py-3 px-4 rounded-[10px] bg-card border ${errors.description ? 'border-error' : 'border-base'} text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                {...register('description')}
              ></textarea>
              {errors.description && <span className="text-tiny text-error">{errors.description.message}</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Theme" {...register('theme')} error={errors.theme?.message} />
              <Select label="Mode" {...register('mode')} error={errors.mode?.message}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </Select>
            </div>
            {mode === 'offline' && (
              <Input label="Venue" {...register('venue')} error={errors.venue?.message} />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-h3 font-semibold text-body mb-6">Timeline & Prizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input type="datetime-local" label="Registration Start" {...register('registrationStartDate')} error={errors.registrationStartDate?.message} />
            <Input type="datetime-local" label="Registration Deadline" {...register('registrationDeadline')} error={errors.registrationDeadline?.message} />
            <Input type="datetime-local" label="Event Start" {...register('startDate')} error={errors.startDate?.message} />
            <Input type="datetime-local" label="Event End" {...register('endDate')} error={errors.endDate?.message} />
            <Input type="datetime-local" label="Submission Deadline" {...register('submissionDeadline')} error={errors.submissionDeadline?.message} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="number" label="Prize Pool ($)" {...register('prizePool')} error={errors.prizePool?.message} />
            <Input type="number" label="Max Team Size" {...register('maxTeamSize')} error={errors.maxTeamSize?.message} />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h3 font-semibold text-body">Rules</h2>
            <Button type="button" size="sm" variant="secondary" onClick={() => appendRule({ value: '' })}>Add Rule</Button>
          </div>
          <div className="space-y-3">
            {ruleFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input placeholder={`Rule ${index + 1}`} {...register(`rules.${index}.value`)} error={errors.rules?.[index]?.value?.message} />
                <Button type="button" variant="ghost" className="text-error h-11" onClick={() => removeRule(index)}>✕</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h3 font-semibold text-body">Judging Criteria</h2>
            <Button type="button" size="sm" variant="secondary" onClick={() => appendCriteria({ criterion: '', maxMarks: 10 })}>Add Criterion</Button>
          </div>
          <div className="space-y-3">
            {criteriaFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input placeholder="Criterion (e.g. Innovation)" {...register(`judgingCriteria.${index}.criterion`)} error={errors.judgingCriteria?.[index]?.criterion?.message} />
                </div>
                <div className="w-24">
                  <Input type="number" placeholder="Max" {...register(`judgingCriteria.${index}.maxMarks`)} error={errors.judgingCriteria?.[index]?.maxMarks?.message} />
                </div>
                <Button type="button" variant="ghost" className="text-error h-11" onClick={() => removeCriteria(index)}>✕</Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Save Hackathon</Button>
        </div>
      </form>
    </div>
  );
}
