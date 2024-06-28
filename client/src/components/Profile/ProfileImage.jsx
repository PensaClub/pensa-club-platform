import "./profile.css";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { useImagePreview } from "../hooks/useImagePreview";
import { uploadImage } from "../../utils/uploadImage";
import { UserContext } from "../contexts/UserContext";

export const ProfileImage = () => {
  const { t } = useTranslation();

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  const { onEditProfileDataSubmit, profileData } = useContext(UserContext);
  const { previewImage, handleImage } = useImagePreview();

  const [imageUpload, setImageUpload] = useState(null);

  const handleUpload = async () => {
    if (!imageUpload) return;
    if (!allowedTypes.includes(imageUpload.type)) {
      throw new Error(`Type ${imageUpload.type} is not allowed! Allowed types are png/jpeg/jpg`);
    }
    try {
      const data = await uploadImage(imageUpload, profileData.details.firebaseImagePath);
      await onEditProfileDataSubmit({ imageURL: data.url, firebaseImagePath: data.filePath });
    } catch (error) {
      throw new Error("Error uploading image: ", error);
    }
  };

  return (
    <>
      <section className="profile-data">
        <div className="profile-data__inner">
          <div className="avatar">
            <img src={previewImage || "/images/sign-up/avatar.jpg"} alt="User avatar" />
          </div>
          <div className="user-data">
            <input
              type="file"
              class="image"
              id="imageUrl"
              onChange={(e) => {
                setImageUpload(e.target.files[0]);
                handleImage(e);
              }}
            />
            <label for="imageUrl" class="label">
              {t("profile.change_photo")}
            </label>
          </div>
          <button onClick={handleUpload} className="label">
            Upload Photo
          </button>
        </div>
      </section>
    </>
  );
};
