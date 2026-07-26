import { useQuery, useMutation } from '@tanstack/react-query';
import { hackathonApi } from '../api/hackathons.api';

export function useHackathons(params = {}) {
  return useQuery({
    queryKey: ['hackathons', params],
    queryFn: () => hackathonApi.getAll(params),
  });
}

export function useHackathon(id) {
  return useQuery({
    queryKey: ['hackathon', id],
    queryFn: () => hackathonApi.getById(id),
    enabled: !!id
  });
}

export function useLeaderboard(id) {
  return useQuery({
    queryKey: ['leaderboard', id],
    queryFn: () => hackathonApi.getLeaderboard(id),
    enabled: !!id,
    retry: false
  });
}

export function useRegisterHackathon(id, options = {}) {
  return useMutation({
    mutationFn: (teamId) => hackathonApi.register(id, teamId),
    ...options
  });
}
