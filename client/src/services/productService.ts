import apiClient from '@/api/apiClient';

export const productService = {
  getProducts: async (params: { category?: string; search?: string; filter?: string; page?: number } = {}) => {
    try {
      const response = await apiClient.get('products/', { params });
      return response.data;
    } catch (error) {
      console.error("Fetch Products Failed", error);
      throw error;
    }
  },

  getProductById: async (id: string | number) => {
    try {
      const response = await apiClient.get(`products/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Fetch Product ${id} Failed`, error);
      throw error;
    }
  },

  getCategoryProducts: async (category: string) => {
    try {
      const response = await apiClient.get('products/', { params: { category } });
      return response.data;
    } catch (error) {
      console.error(`Fetch Category ${category} Failed`, error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('categories/');
      return response.data;
    } catch (error) {
       console.error("Fetch Categories Failed", error);
       throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await apiClient.get('orders/');
      return response.data;
    } catch (error) {
      console.error("Fetch Orders Failed", error);
      throw error;
    }
  },

  postReview: async (productId: string | number, payload: { rating: number; comment: string }) => {
    try {
      const response = await apiClient.post(`products/${productId}/reviews/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Submit Review Failed for product ${productId}`, error);
      throw error;
    }
  }
};
