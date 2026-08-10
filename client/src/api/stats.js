import client from './client.js';

export const getStatsOverview = () => client.get('/stats/overview').then((r) => r.data);
