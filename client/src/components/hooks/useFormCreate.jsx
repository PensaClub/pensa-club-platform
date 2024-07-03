import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "../../firebase"; 
import imageCompression from "browser-image-compression";
import { v4 } from "uuid";

export const useFormCreate = (initialValues, onSubmitHandler) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([null, null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);

  console.log(images);

  const onChangeHandler = (e) => {
    setValues((state) => ({ ...state, [e.target.name]: e.target.value }));
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      setErrors((state) => ({ ...state, [name]: 'This field is required!' }));
    } else {
      setErrors((state) => ({ ...state, [name]: '' }));
    }
  };

  const handleImageChange = (event) => {
    const files = event.target.files;
    const newImages = [...images];
    const newImageFiles = [...imageFiles];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const emptyIndex = newImages.findIndex(image => image === null);
      if (emptyIndex !== -1) {
        newImages[emptyIndex] = URL.createObjectURL(file);
        newImageFiles[emptyIndex] = file;
      }
    }

    setImages(newImages);
    setImageFiles(newImageFiles);
  };

  const handleTrimFields = () => {
    const trimmedValues = Object.keys(values).reduce((acc, key) => {
      const value = values[key];
      acc[key] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {});
    setValues(trimmedValues);
  };


  const onSubmit = async (e) => {
    e.preventDefault();
    handleTrimFields();

      try {
        const uploadTasks = imageFiles.map(async (file) => {
          if (!file) return null;

          const options = {
            maxSizeMB: 5,
            maxWidthOrHeight: 350,
          };

          const compressedFile = await imageCompression(file, options);
          const imageRef = ref(firebaseStorage, `ads/${v4()}`);
          const snapshot = await uploadBytes(imageRef, compressedFile);
          const url = await getDownloadURL(snapshot.ref);

          return { url, path: imageRef.fullPath };
        });

        const imageUrls = await Promise.all(uploadTasks);
    
        if (onSubmitHandler) onSubmitHandler({ ...values, images: imageUrls });
        
        setValues(initialValues);
        setErrors({});
        setImages([null, null, null, null]);
        setImageFiles([null, null, null, null]);
      } catch (error) {
        console.error('Error uploading images: ', error); //NOTIFICATIONS
      }
 
  };

  return {
    onChangeHandler,
    onBlurHandler,
    values,
    onSubmit,
    setValues,
    errors,
    images,
    handleImageChange,
  };
};
