import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import {
  validateField,
  generateNumberOptions,
  trimObjectStrings,
  handleReset,
} from "../../utils/profile.jsx";
import { UserContext } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useImagePreview } from "../hooks/useImagePreview";
import { useMappingContext } from "../contexts/MapContext";
import { useImageUpload } from "../hooks/useImageUpload";
import { loadData } from "../../utils/loadData";
import { toast } from "react-toastify";
import CustomSelect from "./CustomSelect";

export const ProfileData = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { onEditProfileDataSubmit, profileData } = useContext(UserContext);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [workOptions, setWorkOptions] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const { setAllUsers } = useMappingContext();
  const { handleImageChange, uploadImages, images } = useImageUpload();
  const { previewImage, handleImage } = useImagePreview();

  const initialFormState = {
    username: profileData?.details?.username || "",
    email: profileData.email,
    firstName: profileData?.details?.firstName || "",
    lastName: profileData?.details?.lastName || "",
    phoneNumber: profileData?.details?.phoneNumber || "",
    gender: profileData?.details?.gender || null,
    birthDate: profileData?.details?.birthDate || null,
    imageURL: profileData?.details?.imageURL || null,
    firebaseImagePath: profileData?.details?.firebaseImagePath || null,
    skills: profileData?.details?.skills || [],
    interestOptions: profileData?.details?.interestOptions || [],
    workOptions: profileData?.details?.workOptions || [],
  };

  const [form, setForm] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }

    setIsFormChanged(true);
  };
  const handleGenderChange = (e) => {
    setForm({ ...form, gender: e.target.value });
    setIsFormChanged(true);
  };

  useEffect(() => {
    loadData("/options.json")
      .then((data) => {
        setInterestOptions(data.interestOptions);
        setSkillsOptions(data.skills);
        setWorkOptions(data.workOptions);
      })
      .catch((err) => console.error(err.message));
  }, []);

  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDate}`;
      setForm((prevForm) => ({
        ...prevForm,
        birthDate: formattedDate,
      }));
      setIsFormChanged(true);
    } else if (!selectedDate && !selectedMonth && !selectedYear) {
      setForm((prevForm) => ({
        ...prevForm,
        birthDate: "",
      }));
    }
  }, [selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    if (profileData) {
      setAllUsers((prevUsers) => {
        if (
          !prevUsers ||
          !prevUsers.response ||
          !Array.isArray(prevUsers.response.accounts)
        ) {
          return {
            response: {
              accounts: [profileData],
            },
          };
        }

        const updatedAccounts = prevUsers.response.accounts.map((user) =>
          user.email === profileData.email ? { ...user, ...profileData } : user
        );

        if (!updatedAccounts.some((user) => user.email === profileData.email)) {
          updatedAccounts.push(profileData);
        }

        return {
          ...prevUsers,
          response: {
            ...prevUsers.response,
            accounts: updatedAccounts,
          },
        };
      });
    }
  }, [profileData, setAllUsers]);

  const handleSelectedDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (e.target.value === "") {
      setForm((prevForm) => ({ ...prevForm, birthDate: "" }));
    }
    setIsFormChanged(true);
  };

  const handleSelectedMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (e.target.value === "") {
      setForm((prevForm) => ({ ...prevForm, birthDate: "" }));
    }
    setIsFormChanged(true);
  };

  const handleSelectedYearChange = (e) => {
    setSelectedYear(e.target.value);
    if (e.target.value === "") {
      setForm((prevForm) => ({ ...prevForm, birthDate: "" }));
    }
    setIsFormChanged(true);
  };

  const getProfileImage = (gender) => {
    switch (gender) {
      case "male":
        return "/images/homePage/user-male.png";
      case "female":
        return "/images/homePage/user-female.png";
      case "other":
        return "/images/homePage/user-it.png";
      default:
        return "/images/homePage/user-img.png";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const adjustedForm = { ...form };
    if (!selectedDate) adjustedForm.birthDate = null;
    if (!selectedMonth) adjustedForm.birthDate = null;
    if (!selectedYear) adjustedForm.birthDate = null;

    const trimmedForm = trimObjectStrings(adjustedForm);
    setForm(trimmedForm);

    const isValid = Object.keys(trimmedForm).every((field) => {
      const value = trimmedForm[field];
      const error = validateField(field, value);
      setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
      return !error;
    });

    if (isValid) {
      try {
        let updatedForm;
        if (images.length > 0) {
          updatedForm = await uploadImages(
            trimmedForm,
            profileData.details.firebaseImagePath
          );
        } else {
          updatedForm = trimmedForm;
        }

        const changedData = {};
        Object.keys(updatedForm).forEach((key) => {
          if (updatedForm[key] !== initialFormState[key]) {
            changedData[key] = updatedForm[key];
          }
        });

        await onEditProfileDataSubmit(changedData);

        window.scrollTo(0, 0);
        navigate("/profile/data");
      } catch (error) {
        return toast.error(
          t("errors.profile_data_submit", { error: error.message })
        );
      }
    }
  };

  const onBlurHandler = (e) => {
    setIsYearSelectOpen(false);
    const { name, value } = e.target;
    const error = validateField(name, value, form, t);
    console.log(`Field ${name} value ${value} blurred with error: ${error}`);

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleResetForm = () => {
    handleReset(setForm, initialFormState);
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
    setIsFormChanged(false);
    navigate("/profile");
  };

  return (
    <section className="profile-section-edit">
      <form onSubmit={handleSubmit} className="profile-form">
        <h3>{t("profile.personal_data")}</h3>
        <div className="avatar">
          <img
            src={
              previewImage ||
              profileData?.details?.imageURL ||
              getProfileImage(profileData?.details?.gender) ||
              "/images/homePage/user-img.png"
            }
            alt={t("profile.profile_data_alt")}
          />
          <div className="user-data">
            <input
              type="file"
              className="input-image"
              id="imageUrl"
              onChange={(e) => {
                handleImageChange(e);
                handleImage(e);
                setIsFormChanged(true);
              }}
            />
            <label htmlFor="imageUrl" className="btn-general btn-orange">
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
            {errors.username && (
              <span className="error">{errors.username}</span>
            )}
          </div>
          <div>
            <label htmlFor="firstName">{t("profile.first_name")}:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
            />
            {errors.firstName && (
              <span className="error">{errors.firstName}</span>
            )}
          </div>
          <div>
            <label htmlFor="lastName">{t("profile.last_name")}:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleInputChange}
              onBlur={onBlurHandler}
            />
            {errors.lastName && (
              <span className="error">{errors.lastName}</span>
            )}
          </div>
          <div className="gender">
            <label>{t("profile.gender")}:</label>
            <div className="gender-options">
              <div>
                <label>
                  {t("profile.male")}
                  <input
                    type="radio"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleGenderChange}
                  />
                </label>
              </div>
              <div>
                <label>
                  {t("profile.female")}
                  <input
                    type="radio"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleGenderChange}
                  />
                </label>
              </div>
              <div>
                <label>
                  {" "}
                  {t("profile.other")}
                  <input
                    type="radio"
                    value="other"
                    checked={form.gender === "other"}
                    onChange={handleGenderChange}
                  />
                </label>
              </div>
            </div>
          </div>
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
            {errors.phoneNumber && (
              <span className="error">{errors.phoneNumber}</span>
            )}
          </div>
          <div className="date">
            <label>{t("profile.age")}:</label>
            <div>
              <label>
                <select
                  value={selectedDate}
                  onChange={handleSelectedDateChange}
                >
                  <option value="">{t("profile.day")}</option>
                  {generateNumberOptions(1, 31)}
                </select>
              </label>
            </div>
            <div>
              <label>
                <select
                  value={selectedMonth}
                  onChange={handleSelectedMonthChange}
                >
                  <option value="">{t("profile.month")}</option>
                  {generateNumberOptions(1, 12)}
                </select>
              </label>
            </div>
            <div>
              <label>
                <select
                  value={selectedYear}
                  onChange={handleSelectedYearChange}
                  onFocus={() => {
                    setIsYearSelectOpen(true);
                    if (!selectedYear) setSelectedYear(2000);
                  }}
                  onBlur={onBlurHandler}
                >
                  <option value="">
                    {isYearSelectOpen ? t("profile.year") : t("profile.year")}
                  </option>
                  {generateNumberOptions(new Date().getFullYear(), 1915)}
                </select>
              </label>
            </div>
          </div>
          <div className="skills">
            <label>
              {t("profile.add_skills")}:
              <CustomSelect
                options={skillsOptions}
                selectedOptions={form.skills}
                onSelect={(selected) => setForm({ ...form, skills: selected })}
              />
            </label>
            {errors.skills && <div className="error">{errors.skills}</div>}
          </div>
          <div className="interests">
            <label>
              {t("profile.add_interests")}:
              <CustomSelect
                options={interestOptions}
                selectedOptions={form.interestOptions}
                onSelect={(selected) =>
                  setForm({ ...form, interestOptions: selected })
                }
              />
            </label>
            {errors.interestOptions && (
              <div className="error">{errors.interestOptions}</div>
            )}
          </div>
          <div className="works">
            <label>
              {t("profile.add_jobs")}:
              <CustomSelect
                options={workOptions}
                selectedOptions={form.workOptions}
                onSelect={(selected) =>
                  setForm({ ...form, workOptions: selected })
                }
              />
            </label>
            {errors.workOptions && (
              <div className="error">{errors.workOptions}</div>
            )}
          </div>
          <span className="required-fields">
            {t("profile.required_fields")}
          </span>
        </div>
        <div className="btn-inline">
          <button
            type="submit"
            className="btn-general btn-green"
            disabled={!isFormChanged}
          >
            {t("profile.save_btn")}
          </button>
          {/* <button
            type="button"
            className="btn-general btn-red"
            onClick={handleResetForm}
          >
            {t("profile.close_btn")}
          </button> */}
        </div>
      </form>
    </section>
  );
};
