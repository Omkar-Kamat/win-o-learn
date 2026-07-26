import { axiosClient } from './axiosClient';

export const teamApi = {
  getAll: async () => {
    const res = await axiosClient.get('/teams');
    return res.data.data;
  },
  
  getById: async (id) => {
    const res = await axiosClient.get(`/teams/${id}`);
    return res.data.data;
  },
  
  create: async (data) => {
    const res = await axiosClient.post('/teams', data);
    return res.data;
  },
  
  inviteMember: async (id, email) => {
    const res = await axiosClient.post(`/teams/${id}/invite`, { email });
    return res.data;
  }
};
