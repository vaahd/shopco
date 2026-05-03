import apiClient from '@/api/apiClient';

export const authService = {
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    try {
      const response = await apiClient.post('auth/change-password/', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || "Password change failed";
      throw new Error(message);
    }
  },
};