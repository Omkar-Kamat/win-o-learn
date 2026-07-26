import { useQuery, useMutation } from '@tanstack/react-query';
import { teamApi } from '../api/teams.api';

export function useTeams() {
 return useQuery({
 queryKey: ['teams'],
 queryFn: () => teamApi.getAll()
 });
}

export function useTeam(id) {
 return useQuery({
 queryKey: ['team', id],
 queryFn: () => teamApi.getById(id),
 enabled: !!id
 });
}

export function useCreateTeam(options = {}) {
 return useMutation({
 mutationFn: (data) => teamApi.create(data),
 ...options
 });
}

export function useInviteMember(id, options = {}) {
 return useMutation({
 mutationFn: (email) => teamApi.inviteMember(id, email),
 ...options
 });
}
