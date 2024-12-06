import { useCallback, useState } from 'react';
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

export const useImagePreview = () => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImage = useCallback((input) => {
    if (!input) return;

    if (typeof input === 'string') {
      setPreviewImage(input);
      return;
    }

    if (input.target && input.target.files) {
      const file = input.target.files[0];
      
      if (!allowedTypes.includes(file.type)) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };

      return reader.readAsDataURL(file);
    }
  }, []);

  return { previewImage, handleImage };
};
