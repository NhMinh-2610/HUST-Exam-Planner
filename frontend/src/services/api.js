import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const uploadPdf = async (files) => {
  const formData = new FormData();
  
  // Convert to array if single file is passed
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    formData.append('files', file); // 'files' matches backend argument name
  });
  
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
