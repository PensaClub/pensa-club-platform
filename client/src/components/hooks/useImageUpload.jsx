import { useState } from 'react';
import { uploadImageToFirebase } from '../../utils/uploadImageToFirebase';
import { t } from 'i18next';
import { toast } from 'react-toastify';
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

export function useImageUpload() {
  const [images, setImages] = useState([]);

  const addImage = (newImage, index) => {
    if (newImage && allowedTypes.includes(newImage.type)) {
      if (index) {
        setImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = newImage;
          return updatedImages;
        });
      } else {
        setImages((prevImages) => [...prevImages, newImage]);
      }
    } else {
      const type = newImage?.type ? newImage.type.split('/')[0] : t('errors.unknown');
      const errorMessage = t('errors.image_type', { type });
      return toast.error(errorMessage);
    }
  };

  const handleImageChange = (e, index) => {
    addImage(e.target.files[0], index);
  };

  const uploadImages = async (form, path) => {
    const response = await Promise.all(
      images.map(async (image, index) => {
        const oldPath = Array.isArray(path) ? path[index]?.path : path;
        try {
          return await uploadImageToFirebase(image, oldPath);
        } catch (error) {
          throw new Error(error);
        }
      })
    );

    if (response) {
      if (response.length === 1) {
        form.imageURL = response[0].url;
        form.firebaseImagePath = response[0].filePath;
      } else {
        form.images = response.map((image) => ({
          imageURL: image.url,
          firebaseImagePath: image.filePath,
        }));
      }
    }

    return form;
  };

  return { handleImageChange, uploadImages };
}
