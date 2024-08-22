import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "../../firebase";
import imageCompression from "browser-image-compression";
import { v4 } from "uuid";
import { validateFieldCreateAd } from "../../utils/ad";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/notify";
// import defaultImage from 'public/images/community/no-image.png';

export const useFormCreate = (initialValues, onSubmitHandler, emailPrefix) => {
  const [values, setValues] = useState(initialValues);

  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([null, null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const { t } = useTranslation();
  const defaultImageURL = '/images/community/no-image1.png';
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    if (name in values.extraFields) {
      setValues((state) => ({
        ...state,
        extraFields: { ...state.extraFields, [name]: value },
      }));
    } else {
      setValues((state) => ({ ...state, [name]: value }));
    }
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    let error = validateFieldCreateAd(name, value, t);

    if (name in values.extraFields) {
      setErrors((prevState) => ({
        ...prevState,
        extraFields: {
          ...prevState.extraFields,
          [name]: error,
        },
      }));
    } else {
      setErrors((prevState) => ({
        ...prevState,
        [name]: error,
      }));
    }
  };
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    const targetIndex = parseInt(event.target.dataset.index, 10);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      if (!allowedTypes.includes(file.type)) {
        console.error(
          `Type ${file.type} is not allowed! Allowed types are png/jpeg/jpg`
        );
        continue;
      }

      if (!isNaN(targetIndex)) {
        const newIndex = targetIndex + i;
        if (newIndex < images.length) {
          newImages[targetIndex + i] = URL.createObjectURL(file);
          newImageFiles[targetIndex + i] = file;
        }
      } else {
        const emptyIndex = newImages.findIndex((image) => image === null);
        if (emptyIndex !== -1) {
          newImages[emptyIndex] = URL.createObjectURL(file);
          newImageFiles[emptyIndex] = file;
        }
      }
    }

    setImages(newImages);
    setImageFiles(newImageFiles);
    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newImageFiles = [...imageFiles];

    newImages[index] = null;
    newImageFiles[index] = null;

    setImages(newImages);
    setImageFiles(newImageFiles);
  };
  const handleTrimFields = () => {
    const trimmedValues = Object.keys(values).reduce((acc, key) => {
      if (key === "extraFields") {
        acc[key] = Object.keys(values[key]).reduce((innerAcc, innerKey) => {
          innerAcc[innerKey] =
            typeof values[key][innerKey] === "string"
              ? values[key][innerKey].trim()
              : values[key][innerKey];
          return innerAcc;
        }, {});
      } else {
        acc[key] =
          typeof values[key] === "string" ? values[key].trim() : values[key];
      }
      return acc;
    }, {});
    setValues(trimmedValues);
  };

  const filterEmptyFields = (formData) => {
    const filteredData = {};
    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== "" &&
        formData[key] !== null &&
        formData[key] !== undefined
      ) {
        filteredData[key] = formData[key];
      }
    });
    return filteredData;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    handleTrimFields();
  
    const hasErrors = Object.values(errors).some(
      (error) => error !== null && Object.values(error).length > 0
    );
  
    if (hasErrors) {
      notify("form_contains_errors");
      return; 
    }
  
    try {
      let uploadTasks = [];
    
      if (imageFiles.every(file => file === null)) {
        const defaultFile = await fetch(defaultImageURL).then(res => res.blob());
        const imageRef = ref(firebaseStorage, `ads/${emailPrefix}/${v4()}`);
        const snapshot = await uploadBytes(imageRef, defaultFile);
        const imageURL = await getDownloadURL(snapshot.ref);
        uploadTasks = [{ imageURL, firebaseImagePath: imageRef.fullPath }];
      } else {
        uploadTasks = imageFiles.map(async (file, index) => {
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
      }
    
      const imageUrls = await Promise.all(uploadTasks);
      const newImages = imageUrls.filter((x) => x !== null);
      const newImagesIndexes = imageUrls.reduce(
        (acc, url, urlIndex) => (url ? [...acc, urlIndex] : acc),
        []
      );
  
      let filteredImageObjects = values?.images ? [...values?.images] : [];
  
      newImages.forEach((newImage, index) => {
        filteredImageObjects[newImagesIndexes[index]] = newImage; 
      });
  
      filteredImageObjects = filteredImageObjects.filter(
        (val) =>
          images.includes(val.imageURL) || 
          newImages.some((img) => img.imageURL === val.imageURL) 
      );
  
      const filteredValues = filterEmptyFields({
        ...values,
        images: filteredImageObjects,
      });
      if (onSubmitHandler) onSubmitHandler(filteredValues);
  
      setValues(initialValues);
      setErrors({});
      setImages([null, null, null, null]);
      setImageFiles([null, null, null, null]);
    } catch (error) {
      console.error("Error uploading images: ", error);
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
    setImages,
    handleImageChange,
    handleRemoveImage,
  };
};
