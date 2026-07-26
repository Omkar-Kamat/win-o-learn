import { axiosClient } from './axiosClient';

export const hackathonApi = {
 getAll: async (params) => {
 const res = await axiosClient.get('/hackathons', { params });
 return res.data.data;
 },
 
 getById: async (id) => {
 const res = await axiosClient.get(`/hackathons/${id}`);
 return res.data.data;
 },
 
 getLeaderboard: async (id) => {
 const res = await axiosClient.get(`/hackathons/${id}/leaderboard`);
 return res.data.data;
 },
 
 register: async (id, teamId) => {
 const res = await axiosClient.post(`/hackathons/${id}/register`, { teamId });
 return res.data;
 }
};
