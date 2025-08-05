import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';



// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    if (error.response?.status === 403) {
      console.error('Authentication error - you may need to login again');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register/', { username, email, password });
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout/');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};

// Forms API calls
export const formsAPI = {
  getForms: async () => {
    try {
      const response = await api.get('/forms/');
      console.log('Forms fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  },
  
  createForm: async (formData) => {
    try {
      console.log('Creating form with data:', formData);
      const response = await api.post('/forms/', formData);
      console.log('Form created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  },
  
  getForm: async (formId) => {
    try {
      const response = await api.get(`/forms/${formId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  },
  
  getFormQuestions: async (formId) => {
    try {
      const response = await api.get(`/forms/${formId}/questions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },
};

// Responses API calls
// Find this existing responsesAPI object in your api.js file:
export const responsesAPI = {
  submitResponse: async (formId, responseData) => {
    try {
      const response = await api.post(`/responses/form/${formId}/`, responseData);
      return response.data;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  },
  
  getFormResponses: async (formId) => {
    try {
      const response = await api.get(`/responses/form/${formId}/responses/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching responses:', error);
      throw error;
    }
  },

  // ADD THIS NEW FUNCTION HERE (don't create a new responsesAPI object)
  exportCSV: async (formId) => {
    try {
      const response = await api.get(`/responses/form/${formId}/export/`, {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'responses.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },
};


export default api;
