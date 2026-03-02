/* eslint-disable react-hooks/exhaustive-deps */
import {
  validateField,
  generateNumberOptions,
  trimObjectStrings,
  resetFields,
  handleReset,
} from "../../utils/profile.jsx";
import CustomSelect from "./CustomSelect";
import React, { useState, useEffect, useContext } from "react";
import { LocalizedLink as Link } from '../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { UserContext } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { loadData } from "../../utils/loadData";

import { useImagePreview } from "../hooks/useImagePreview";
import { useMappingContext } from "../contexts/MapContext";
import { useImageUpload } from "../hooks/useImageUpload";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ProfileForm = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const navigate = useLocalizedNavigate();
  const { onProfileDataSubmit } = useContext(UserContext);
  const { onAllUsers, allUsers, setAllUsers } = useMappingContext();

  const { handleImageChange, uploadImages } = useImageUpload();
  // const { previewImage, handleImage } = useImagePreview();

  const [persistedData, setPersistedData] = useLocalStorage(
    "persistedData",
    {}
  );

  const initialFormState = {
    username: persistedData?.username || "",
    region: persistedData?.region || "",
    regionId: persistedData?.regionId || "",
    // municipality: persistedData?.municipality || "",
    // municipalityId: persistedData?.municipalityId || "",
    // settlement: persistedData?.settlement || "",
    // settlementId: persistedData?.settlementId || "",
    // district: persistedData?.district || "",
    // block: persistedData?.block || "",
    // street: persistedData?.street || "",
    // streetNumber: persistedData?.streetNumber || "",
    // birthDate: persistedData?.birthDate || null,
    skills: persistedData?.skills || [],
    interestOptions: persistedData?.interestOptions || [],
    workOptions: persistedData?.workOptions || [],
    // imageURL: persistedData?.imageURL || null,
    // firebaseImagePath: persistedData?.firebaseImagePath || null,
  };
  const [form, setForm] = useState(initialFormState);

  const [regions, setRegions] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [settlements, setSettlements] = useState([]);

  // const [skillsOptions, setSkillsOptions] = useState([]);
  // const [workOptions, setWorkOptions] = useState([]);
  // const [interestOptions, setInterestOptions] = useState([]);
  // const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  // const [selectedDate, setSelectedDate] = useState("");
  // const [selectedMonth, setSelectedMonth] = useState("");
  // const [selectedYear, setSelectedYear] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    
    loadData("/regions.json")
      .then((data) => setRegions(data))
      .catch((err) => console.error(err.message));

    if (persistedData?.municipality) {
      loadData(
        `/regions-data/region-${form.regionId}/subregions-${form.regionId}.json`
      )
        .then((data) => setMunicipalities(data))
        .catch((err) => console.error(err.message));
    }

    if (persistedData?.settlement) {
      loadData(
        `/regions-data/region-${form.regionId}/towns/towns-${form.municipalityId}.json`
      )
        .then((data) => setSettlements(data))
        .catch((err) => console.error(err.message));
    }

  //   loadData("/options.json")
  //     .then((data) => {
  //       setInterestOptions(data.interestOptions);
  //       setSkillsOptions(data.skills);
  //       setWorkOptions(data.workOptions);
  //     })
  //     .catch((err) => console.error(err.message));
  }, []);

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    if (!regionId) return;
    const currRegion = regions.filter((region) => region.id == regionId);
    const regionName = currRegion[0].bg;

    setForm({
      ...form,
      regionId: regionId,
      region: regionName,
      municipalityId: "",
      municipality: "",
      settlementId: "",
      settlement: "",
    });
    setMunicipalities([]);
    setSettlements([]);

    try {
      const response = await fetch(
        `/regions-data/region-${regionId}/subregions-${regionId}.json`
      );

      const data = await response.json();

      setMunicipalities(data);
    } catch (error) {
      console.error("Failed to load municipalities data", error);
    }
  };

  useEffect(() => {
    const updateErrorsTranslation = () => {
      const translatedErrors = {};
      Object.keys(errors).forEach((field) => {
        const error = validateField(field, form[field], form, t);
        if (error) {
          translatedErrors[field] = error;
        }
      });
      setErrors(translatedErrors);
    };

    updateErrorsTranslation();
  }, [currentLanguage]);

  const handleMunicipalityChange = async (e) => {
    const municipalityId = e.target.value;
    if (!municipalityId) return;
    const currMunicipality = municipalities.filter(
      (municipality) => municipality.id == municipalityId
    );
    const municipalityName = currMunicipality[0].bg;

    setForm({
      ...form,
      municipalityId: municipalityId,
      municipality: municipalityName,
      settlement: "",
    });
    setSettlements([]);

    try {
      const response = await fetch(
        `/regions-data/region-${form.regionId}/towns/towns-${municipalityId}.json`
      );
      const data = await response.json();
      setSettlements(data);
    } catch (error) {
      console.error("Failed to load settlements data", error);
    }
  };

  const handleSettlementChange = async (e) => {
    const settlementId = e.target.value;
    if (!settlementId) return;
    const currSettlement = settlements.filter(
      (settlement) => settlement.id == settlementId
    );
    const settlementName = currSettlement[0].bg;

    setForm({
      ...form,
      settlementId: settlementId,
      settlement: settlementName,
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  // const handleGenderChange = (e) => {
  //   setForm({ ...form, gender: e.target.value });
  // };

  // useEffect(() => {
  //   if (selectedDate && selectedMonth && selectedYear) {
  //     const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDate}`;
  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       birthDate: formattedDate,
  //     }));
  //   }
  // }, [selectedDate, selectedMonth, selectedYear]);

  // const handleSelectedDateChange = (e) => {
  //   setSelectedDate(e.target.value);
  // };

  // const handleSelectedMonthChange = (e) => {
  //   setSelectedMonth(e.target.value);
  // };
  // const handleSelectedYearChange = (e) => {
  //   setSelectedYear(e.target.value);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedForm = trimObjectStrings(form);
    setForm(trimmedForm);
    setPersistedData(trimmedForm);

    const validationErrors = {};
    let isValid = true;

    Object.keys(trimmedForm).forEach((field) => {
      const value = trimmedForm[field];

      const error = validateField(field, value, trimmedForm, t);
      if (error) {
        isValid = false;
        validationErrors[field] = error;
      }
    });

    setErrors(validationErrors);

    if (isValid) {
      try {
        const updatedForm = await uploadImages(trimmedForm);
        
        await onProfileDataSubmit(trimmedForm);
        await onAllUsers();

        resetFields(setForm, initialFormState);
        // setSelectedDate("");
        // setSelectedMonth("");
        // setSelectedYear("");
        setPersistedData({});
        window.scrollTo(0, 0);
        navigate("/profile");
      } catch (error) {
        console.error(`Error on profile form submit: ${error.message}`);
      }
    } else {
      console.error("Form validation failed. Errors:", validationErrors);
    }
  };

  const onBlurHandler = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value, form, t);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleResetForm = () => {
    handleReset(setForm, initialFormState);
    // setSelectedDate("");
    // setSelectedMonth("");
    // setSelectedYear("");
  };
  // const handleLogout = () => {
  //   navigate("/logout");
  // };
  return (
    <>
      {/* <form onSubmit={handleSubmit} className="profile-form">
        <h3>{t("profile.profile_form_title")}</h3>
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
        </div>
        <label>
          {t("profile.region")}: <span>*</span>
          <select
            name="region"
            value={form.regionId}
            onChange={handleRegionChange}
            onBlur={onBlurHandler}
            required
            style={{ borderColor: errors.region ? "#BB1D3D" : "" }}
          >
            <option value="">{t("profile.select_region")}</option>
            {regions.map((region, index) => (
              <option key={index} value={region.id}>
                {currentLanguage === "bg" && `${region.bg}`}
                {currentLanguage === "en" && `${region.en}`}
              </option>
            ))}
          </select>
          {errors.region && <span className="error">{errors.region}</span>}
        </label>
       
        <span className="required-fields">{t("profile.required_fields")}</span>
        <div className="btn-inline">
          <button type="submit" className="btn-general btn-green">
            {t("profile.save_btn")}
          </button>
        
        </div>
      </form> */}
    </>
  );
};

export default ProfileForm;
