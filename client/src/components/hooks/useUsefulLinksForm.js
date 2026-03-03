import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useUsefulLinksContext } from '../contexts/UsefulLinksContext';
import { notify } from '../../utils/notify';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { firebaseStorage } from '../../firebase';
import { v4 } from 'uuid';
import imageCompression from 'browser-image-compression';

const INITIAL_FORM_DATA = {
  title: '',
  titleEn: '',
  titleDe: '',
  description: '',
  descriptionEn: '',
  descriptionDe: '',
  url: '',
  imageUrl: '',
  firebaseImagePath: '',
  category: 'general',
  displayOrder: 0,
  isActive: true,
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

const generateSlug = (title) => {
  const bgToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': '',
    'ю': 'yu', 'я': 'ya',
  };

  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .split('')
    .map(char => bgToLatin[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
};

const uploadImageToFirebaseForLinks = async (file, oldFilePath) => {
  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 800,
  };

  const compressedFile = await imageCompression(file, options);
  const imageRef = ref(firebaseStorage, `useful-links/${v4()}`);
  const snapshot = await uploadBytes(imageRef, compressedFile);
  const url = await getDownloadURL(snapshot.ref);

  if (oldFilePath) {
    try {
      const oldFileRef = ref(firebaseStorage, oldFilePath);
      await deleteObject(oldFileRef);
    } catch (err) {
      console.warn('Could not delete old image:', err);
    }
  }

  return { url, filePath: imageRef.fullPath };
};

export const useUsefulLinksForm = () => {
  const { id } = useParams();
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation('useful-links');
  const { createLink, updateLink, getLinkById } = useUsefulLinksContext();

  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const loadLink = async () => {
        try {
          setIsLoading(true);
          const link = await getLinkById(id);
          if (link) {
            setFormData({
              title: link.title || '',
              titleEn: link.titleEn || '',
              titleDe: link.titleDe || '',
              description: link.description || '',
              descriptionEn: link.descriptionEn || '',
              descriptionDe: link.descriptionDe || '',
              url: link.url || '',
              imageUrl: link.imageUrl || '',
              firebaseImagePath: link.firebaseImagePath || '',
              category: link.category || 'general',
              displayOrder: link.displayOrder || 0,
              isActive: link.isActive !== undefined ? link.isActive : true,
            });
            if (link.imageUrl) {
              setImagePreview(link.imageUrl);
            }
          }
        } catch (error) {
          console.error('Error loading link:', error);
          notify('error', t('admin.toast.error'));
        } finally {
          setIsLoading(false);
        }
      };
      loadLink();
    }
  }, [isEditMode, id]);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleImageSelect = useCallback((file) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      notify('error', t('admin.validation.imageTypeInvalid', { defaultValue: 'Невалиден формат. Позволени: JPG, PNG, WebP' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify('error', t('admin.validation.imageTooLarge', { defaultValue: 'Файлът е твърде голям (макс. 10MB)' }));
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: null }));
    }
  }, [errors, t]);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '', firebaseImagePath: '' }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t('admin.validation.titleRequired');
    if (!formData.url.trim()) newErrors.url = t('admin.validation.urlRequired');
    if (!formData.category || !formData.category.trim()) newErrors.category = t('admin.validation.categoryRequired');

    try {
      if (formData.url.trim()) new URL(formData.url.trim());
    } catch {
      newErrors.url = t('admin.validation.urlInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = async () => {
    if (!validateForm()) return false;

    try {
      setIsSaving(true);
      const slug = generateSlug(formData.title);
      const submitData = { ...formData, slug };

      if (imageFile) {
        setIsUploading(true);
        try {
          const oldPath = formData.firebaseImagePath || null;
          const { url: newImageUrl, filePath } = await uploadImageToFirebaseForLinks(imageFile, oldPath);
          submitData.imageUrl = newImageUrl;
          submitData.firebaseImagePath = filePath;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          notify('error', t('admin.toast.imageUploadError', { defaultValue: 'Грешка при качване на снимката' }));
          return false;
        } finally {
          setIsUploading(false);
        }
      }

      if (isEditMode) {
        await updateLink(id, submitData);
        notify('success', t('admin.toast.updated'));
      } else {
        await createLink(submitData);
        notify('success', t('admin.toast.created'));
      }

      navigate('/admin/useful-links');
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setImageFile(null);
    setImagePreview('');
  }, []);

  return {
    isEditMode,
    formData,
    isLoading,
    isSaving,
    isUploading,
    errors,
    imageFile,
    imagePreview,
    updateField,
    validateForm,
    handleSubmit,
    handleImageSelect,
    handleRemoveImage,
    resetForm,
  };
};

export default useUsefulLinksForm;
