/**
 * Core integrations stub - înlocuiește @base44/integrations/Core
 * UploadFile salvează fișierele ca object URL sau base64
 */

export const UploadFile = async ({ file }) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Returnăm un obiect similar cu ce returna base44
      resolve({
        file_url: dataUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
