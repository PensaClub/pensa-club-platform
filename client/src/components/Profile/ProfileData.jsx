import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import { validateField, generateNumberOptions, trimObjectStrings, resetFields, handleReset } from "../../utils/profile";
import { UserContext } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useImagePreview } from "../hooks/useImagePreview";
import { uploadImage } from "../../utils/uploadImage";

export const ProfileData = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userEmail, onEditProfileDataSubmit, profileData } = useContext(UserContext);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [errors, setErrors] = useState({});
  // const [profileData, setProfileData] = useState('')

  //TODO: change keys when changed on server!!!

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  const { previewImage, handleImage } = useImagePreview();
  const [imageUpload, setImageUpload] = useState(null);

  const initialFormState = {
    username: profileData.details.username || "",
    email: profileData.email,
    firstName: profileData.details.firstName || "",
    lastName: profileData.details.lastName || "",
    phoneNumber: profileData.details.phoneNumber || "",
    gender: profileData.details.gender || null,
    birthDate: profileData.details.birthDate || null,
  };
  const [form, setForm] = useState(initialFormState);

  // useEffect(() => {
  //     // debugger
  //     const serializedData = localStorage.getItem("userDetails");
  //     const userData = JSON.parse(serializedData);
  //     if (userData) {
  //         const userDetails = userData.details;
  //         console.log(userDetails);
  //       setProfileData (userDetails);
  //       setForm({...form, userDetails})
  //       console.log(form);
  //     }
  //   }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleGenderChange = (e) => {
    setForm({ ...form, gender: e.target.value });
  };

  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDate}`;
      setForm((prevForm) => ({
        ...prevForm,
        birthDate: formattedDate,
      }));
    }
  }, [selectedDate, selectedMonth, selectedYear]);

  const handleSelectedDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSelectedMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleSelectedYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedForm = trimObjectStrings(form);
    setForm(trimmedForm);

    const isValid = Object.keys(trimmedForm).every((field) => {
      const value = trimmedForm[field];
      const error = validateField(field, value);
      setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
      return !error;
    });

    if (isValid) {
      try {
        const updatedDataArr = Object.entries(form).filter(([key, value]) => initialFormState[key] !== value);
        const updatedData = Object.fromEntries(updatedDataArr);
        let data;
        if (imageUpload) {
          if (!allowedTypes.includes(imageUpload.type)) {
            throw new Error(`Type ${imageUpload.type} is not allowed! Allowed types are png/jpeg/jpg`);
          }
          try {
            data = await uploadImage(imageUpload, profileData.details.firebaseImagePath);
          } catch (error) {
            throw new Error("Error uploading image: ", error);
          }
        }
        if (data) {
          updatedData.imageURL = data.url;
          updatedData.firebaseImagePath = data.filePath;
        }
        await onEditProfileDataSubmit(updatedData);
        console.log("Data Submitted:", updatedData);
        // resetFields(setForm, initialFormState);
        // setSelectedDate('');
        // setSelectedMonth('');
        // setSelectedYear('');
        window.scrollTo(0, 0);
        navigate("/profile");
      } catch (error) {
        console.log(`Error Profile Data Submit Component: ${error.message}`);
      }
    }
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleResetForm = () => {
    handleReset(setForm, initialFormState);
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
  };

  return (
    <section className="profile-section-edit">
      <form onSubmit={handleSubmit} className="profile-form">
        <h3>{t("profile.personal_data")}</h3>
        <div className="avatar">
          <img src={previewImage || "/images/sign-up/avatar.jpg"} alt="User avatar" />
          <div className="user-data">
            <input
              type="file"
              class="input-image"
              id="imageUrl"
              onChange={(e) => {
                setImageUpload(e.target.files[0]);
                handleImage(e);
              }}
            />
            <label for="imageUrl" class="label-image">
              {t("profile.change_photo")}
            </label>
          </div>
        </div>
        <div className="user-data">
          <div>
            <label htmlFor="username">
              {t("profile.username")}: <span>*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
              required
              style={{ borderColor: errors.username ? "#BB1D3D" : "" }}
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>
          <div>
            <label htmlFor="firstName">{t("profile.first_name")}:</label>
            <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleInputChange} onBlur={onBlurHandler} />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>
          <div>
            <label htmlFor="lastName">{t("profile.last_name")}:</label>
            <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleInputChange} onBlur={onBlurHandler} />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>
          <div className="gender">
            <label>{t("profile.gender")}:</label>
            <div className="gender-options">
              <div>
                <label>
                  {t("profile.male")}
                  <input type="radio" value="male" checked={form.gender === "male"} onChange={handleGenderChange} />
                </label>
              </div>
              <div>
                <label>
                  {t("profile.female")}
                  <input type="radio" value="female" checked={form.gender === "female"} onChange={handleGenderChange} />
                </label>
              </div>
              <div>
                <label>
                  {" "}
                  {t("profile.other")}
                  <input type="radio" value="other" checked={form.gender === "other"} onChange={handleGenderChange} />
                </label>
              </div>
            </div>
          </div>
          <div></div>
          {/* <div>
                        <label htmlFor="email">{t('profile.email')}: <span>*</span></label>
                        <input type="email" id="email" name="email" value={form.email} onChange={handleInputChange} onBlur={onBlurHandler} required
                            style={{ borderColor: errors.email ? '#BB1D3D' : '' }}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div> */}
          <div>
            <label htmlFor="phoneNumber">{t("profile.phone_number")}:</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
              style={{ borderColor: errors.phoneNumber ? "#BB1D3D" : "" }}
            />
            {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
          </div>
          <div className="date">
            <label>{t("profile.age")}</label>
            <div>
              <label>
                <select value={selectedDate} onChange={handleSelectedDateChange} onBlur={onBlurHandler}>
                  <option value="">{t("profile.day")}</option>
                  {generateNumberOptions(1, 31)}
                </select>
              </label>
            </div>
            <div>
              <label>
                <select value={selectedMonth} onChange={handleSelectedMonthChange} onBlur={onBlurHandler}>
                  <option value="">{t("profile.month")}</option>
                  {generateNumberOptions(1, 12)}
                </select>
              </label>
            </div>
            <div>
              <label>
                <select value={selectedYear} onChange={handleSelectedYearChange} onBlur={onBlurHandler}>
                  <option value="">{t("profile.year")}</option>
                  {generateNumberOptions(1900, new Date().getFullYear())}
                </select>
              </label>
            </div>
          </div>
          <span className="required-fields">{t("profile.required_fields")}</span>
        </div>
        <div className="btn-inline">
          <button type="submit" className="btn-general btn-green">
            {t("profile.save_btn")}
          </button>
          <button type="submit" className="btn-general btn-red" onClick={handleResetForm}>
            {t("profile.close_btn")}
          </button>
        </div>
      </form>
    </section>
  );
};
