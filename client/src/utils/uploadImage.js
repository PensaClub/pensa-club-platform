import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "../firebase";
import { v4 } from "uuid";

export async function uploadImage(file) {
  if (!file) throw new Error("No file provided for upload.");
  const imageRef = ref(firebaseStorage, `profile-image/${v4()}`);
  const snapshot = await uploadBytes(imageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}
