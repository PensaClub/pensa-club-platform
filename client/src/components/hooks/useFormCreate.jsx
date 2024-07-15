import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "../../firebase";
import imageCompression from "browser-image-compression";
import { v4 } from "uuid";
import { validateFieldCreateAd } from "../../utils/ad";
import { useTranslation } from "react-i18next";

export const useFormCreate = (initialValues, onSubmitHandler, emailPrefix) => {
  const [values, setValues] = useState(initialValues);
 
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([null, null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const { t } = useTranslation();

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

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
        if (key === 'extraFields') {
       
            acc[key] = Object.keys(values[key]).reduce((innerAcc, innerKey) => {
                innerAcc[innerKey] = typeof values[key][innerKey] === 'string' ? values[key][innerKey].trim() : values[key][innerKey];
                return innerAcc;
            }, {});
        } else {

            acc[key] = typeof values[key] === 'string' ? values[key].trim() : values[key];
        }
        return acc;
    }, {});
    setValues(trimmedValues);
};

  const filterEmptyFields = (formData) => {
    const filteredData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
        filteredData[key] = formData[key];
      }
    });
    return filteredData;
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
        const imageRef = ref(firebaseStorage, `ads/${emailPrefix}/${v4()}`);
        const snapshot = await uploadBytes(imageRef, compressedFile);
        const imageURL = await getDownloadURL(snapshot.ref);

        return { imageURL, firebaseImagePath: imageRef.fullPath };
      });

      const imageUrls = await Promise.all(uploadTasks);
      const newImage = imageUrls.filter(x => x !== null);
      const filteredValues = filterEmptyFields({ ...values, images: newImage });
      if (onSubmitHandler) onSubmitHandler(filteredValues);

      setValues(initialValues);
      setErrors({});
      setImages([null, null, null, null]);
      setImageFiles([null, null, null, null]);
    } catch (error) {
      console.error('Error uploading images: ', error);
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
