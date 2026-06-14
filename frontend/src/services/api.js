import axios from 'axios';

const API_URL = 'https://hust-exam-planner.onrender.com';

export const uploadPdf = async (files) => {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];

  fileArray.forEach(file => {
    formData.append('files', file);
  });

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const getDefaultPdf = async () => {
  const response = await axios.get(`${API_URL}/default-schedule`);
  return response.data;
};
