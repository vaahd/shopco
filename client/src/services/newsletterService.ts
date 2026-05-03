import apiClient from '../api/apiClient';

export interface NewsletterSubscriptionData {
  email: string;
}

export const newsletterService = {
  subscribe: async (data: NewsletterSubscriptionData) => {
    const response = await apiClient.post('/newsletter/subscribe/', data);
    return response.data;
  },
};