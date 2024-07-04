import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { firebaseStorage } from '../firebase';
import { v4 } from 'uuid';
import imageCompression from 'browser-image-compression';

export async function uploadImageToFirebase(file, oldFilePath) {
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 350,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const imageRef = ref(firebaseStorage, `profile-image/${v4()}`);
    const snapshot = await uploadBytes(imageRef, compressedFile);
    const url = await getDownloadURL(snapshot.ref);

    if (oldFilePath) {
      const oldFileRef = ref(firebaseStorage, oldFilePath);
      await deleteObject(oldFileRef);
    }
    return { url, filePath: imageRef.fullPath };
  } catch (err) {
    console.log(err);
  }
}
