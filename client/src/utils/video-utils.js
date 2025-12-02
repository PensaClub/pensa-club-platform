// client/src/utils/video-utils.js
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { firebaseStorage } from '../firebase';

// Допустими видео типове
export const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

// Максимален размер (100MB)
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

/**
 * Валидация на видео файл
 */
export const validateVideo = (file) => {
    if (!file) return { valid: false, error: 'Няма избран файл' };
    
    if (!allowedVideoTypes.includes(file.type)) {
        return { valid: false, error: 'Неподдържан формат. Използвайте MP4, WebM или OGG.' };
    }
    
    if (file.size > MAX_VIDEO_SIZE) {
        return { valid: false, error: 'Видеото е твърде голямо (макс 100MB)' };
    }
    
    return { valid: true };
};

/**
 * Генериране на thumbnail от видео
 */
export const generateVideoThumbnail = (videoFile) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        
        video.onloadedmetadata = () => {
            video.currentTime = Math.min(1, video.duration * 0.1);
        };
        
        video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
                    resolve(thumbnailFile);
                } else {
                    reject(new Error('Failed to generate thumbnail'));
                }
            }, 'image/jpeg', 0.8);
            
            URL.revokeObjectURL(video.src);
        };
        
        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Error loading video'));
        };
        
        video.src = URL.createObjectURL(videoFile);
    });
};

/**
 * Качване на видео с прогрес
 */
export const uploadVideoWithProgress = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        const fileRef = ref(firebaseStorage, `${path}/${v4()}-${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);
        
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error('Video upload error:', error);
                reject(error);
            },
            async () => {
                try {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                } catch (err) {
                    reject(err);
                }
            }
        );
    });
};

/**
 * Качване на thumbnail
 */
export const uploadThumbnail = async (thumbnailFile, path) => {
    const fileRef = ref(firebaseStorage, `${path}/thumbnails/${v4()}.jpg`);
    const snapshot = await uploadBytesResumable(fileRef, thumbnailFile);
    return await getDownloadURL(snapshot.ref);
};

/**
 * Качване на видео + автоматично генериране на thumbnail
 */
export const uploadVideoWithThumbnail = async (videoFile, basePath, onProgress) => {
    try {
        // 1. Генерирай thumbnail
        onProgress?.({ stage: 'thumbnail', progress: 0 });
        const thumbnailFile = await generateVideoThumbnail(videoFile);
        onProgress?.({ stage: 'thumbnail', progress: 100 });
        
        // 2. Качи thumbnail
        onProgress?.({ stage: 'thumbnailUpload', progress: 0 });
        const thumbnailUrl = await uploadThumbnail(thumbnailFile, basePath);
        onProgress?.({ stage: 'thumbnailUpload', progress: 100 });
        
        // 3. Качи видео
        onProgress?.({ stage: 'video', progress: 0 });
        const videoUrl = await uploadVideoWithProgress(
            videoFile,
            `${basePath}/videos`,
            (progress) => onProgress?.({ stage: 'video', progress })
        );
        
        return { videoUrl, thumbnailUrl };
    } catch (error) {
        console.error('Error uploading video with thumbnail:', error);
        throw error;
    }
};

/**
 * Получаване на видео duration
 */
export const getVideoDuration = (videoFile) => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            const duration = video.duration;
            URL.revokeObjectURL(video.src);
            resolve(duration);
        };
        
        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            resolve(0);
        };
        
        video.src = URL.createObjectURL(videoFile);
    });
};

/**
 * Форматиране на duration
 */
export const formatVideoDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};