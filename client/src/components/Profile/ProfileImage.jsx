import "./profile.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { useImagePreview } from "../hooks/useImagePreview";
import { uploadImage } from "../../utils/uploadImage";
import { UserContext } from "../contexts/UserContext";

export const ProfileImage = () => {
  const { t } = useTranslation();

  const { onEditProfileDataSubmit } = useContext(UserContext);
  const { previewImage, handleImage } = useImagePreview();

  const [imageUpload, setImageUpload] = useState(null);

  const handleUpload = async () => {
    if (!imageUpload) return;
    try {
      const url = await uploadImage(imageUpload);
      await onEditProfileDataSubmit({ imageURL: url });
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };

  return (
    <>
      <section className="profile-data">
        <div className="avatar">
          <img src={previewImage || "/images/sign-up/avatar.jpg"} alt="User avatar" />
        </div>
        <div className="user-data">
          <input
            type="file"
            onChange={(e) => {
              setImageUpload(e.target.files[0]);
              handleImage(e);
            }}
          />
          <button onClick={handleUpload}>Upload image</button>
          <Link to="#">
            <h3>{t("profile.change_photo")}</h3>
          </Link>
        </div>
      </section>
    </>
  );
};
