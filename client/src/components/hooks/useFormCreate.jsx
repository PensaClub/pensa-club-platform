import { useState, useEffect } from "react";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { firebaseStorage } from "../../firebase"; 
import imageCompression from "browser-image-compression";
import { v4 } from "uuid";

export const useFormCreate = (initialValues, onSubmitHandler, emailPrefix) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([null, null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null, null]); 

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

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

      if (!allowedTypes.includes(file.type)) {
        console.error(`Type ${file.type} is not allowed! Allowed types are png/jpeg/jpg`);
        continue;
      }

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
      acc[key] = typeof values[key] === 'string' ? values[key].trim() : values[key];
      return acc;
    }, {});
    setValues(trimmedValues);
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(values).forEach((key) => {
      if (!values[key].trim()) {
        newErrors[key] = 'This field is required!';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    handleTrimFields();

    if (validate()) {
      try {
        const uploadTasks = imageFiles.map(async (file) => {
          if (!file) return null;

          const options = {
            maxSizeMB: 5,
            maxWidthOrHeight: 350,
          };

          const compressedFile = await imageCompression(file, options);
          const imageRef = ref(firebaseStorage, `ads/${emailPrefix}/${v4()}`);
          const snapshot = await uploadBytes(imageRef, compressedFile);
          const imageURL = await getDownloadURL(snapshot.ref);

          return { imageURL, firebaseImagePath: imageRef.fullPath };
        });

        const imageUrls = await Promise.all(uploadTasks);
        const newImage = imageUrls.filter(x => x !== null)
        if (onSubmitHandler) onSubmitHandler({ ...values, images: newImage });
        
        setValues(initialValues);
        setErrors({});
        setImages([null, null, null, null]);
        setImageFiles([null, null, null, null]);
      } catch (error) {
        console.error('Error uploading images: ', error);
      }
    } else {
      console.log("Invalid form");
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
