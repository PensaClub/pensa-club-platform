import { useState } from "react";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { firebaseStorage } from "../../firebase"; 
import imageCompression from "browser-image-compression";

import { v4 } from "uuid";
export const useFormCreate = (initialValues, onSubmitHandler) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([null, null, null, null]);
console.log(values)

console.log(images)
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

  const handleImageChange = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 350,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const imageRef = ref(firebaseStorage, `ads/${v4()}`);
      const snapshot = await uploadBytes(imageRef, compressedFile);
      const url = await getDownloadURL(snapshot.ref);

      const newImages = [...images];
      newImages[index] = { url, path: imageRef.fullPath };
      setImages(newImages);
    } catch (error) {
      console.error('Error uploading image: ', error);
    }
  };
  const handleTrimFields = () => {
    const trimmedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = values[key].trim();
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

  const onSubmit = (e) => {
    e.preventDefault();
    handleTrimFields();

    if (validate()) {
      if (onSubmitHandler) onSubmitHandler(values, images);
      setValues(initialValues);
      setErrors({});
      setImages([null, null, null, null]);
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
