/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import "../CreateAd/createAd.css";
import "../../communityPage.css";
import { CommunityFooter } from "../../CommunityFooter/CommunityFooter";
import { HeaderCommunity } from "../../HeaderCommunity/HeaderCommunity";
import "../../CommunityFooter/communityFooter.css";
import { useCommunityContext } from "../../../contexts/CommunityContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useFormCreate } from "../../../hooks/useFormCreate";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../../contexts/UserContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { TagInput } from "../CreateAd/TagInput";

export const EditAd = () => {
  const { t, i18n } = useTranslation();
  const [fieldDefinitions, setFieldDefinitions] = useState({});
  const [towns, setTowns] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [settlements, setSettlements] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTown, setSelectedTown] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSubregion, setSelectedSubregion] = useState("");
  const [useOtherCity, setUseOtherCity] = useState(false);
  const [previousRegion, setPreviousRegion] = useState("");
  const [previousSubregion, setPreviousSubregion] = useState("");
  const [previousTown, setPreviousTown] = useState("");
  const [previousStreet, setPreviousStreet] = useState("");
  const {
    regions,
    subregions,
    fetchSubregions,
    fetchTowns,
    searchCriteria,
    getAdById,
    editAd,
  } = useCommunityContext();
  const { profileData } = useAuthContext();
  const { adId } = useParams();

  const currentLanguage = i18n.language;
  const navigate = useNavigate();
  const getEmailPrefix = (email) => email.split("@")[0];

  const emailPrefix = getEmailPrefix(profileData.email);

  const getAdTownValue = (language, settlement) => {
    if (!settlement || !settlement.bg || !settlement.en) return "";
    return language === "bg" ? settlement.bg : settlement.en;
  };

  const initialValues = {
    adId: "",
    summary: "",
    category: "",
    description: "",
    adRegion: "",
    adSubregion: "",
    adTown: "",
    street: "",
    useOtherCity: false,
    extraFields: {
      price: "",
      eventStartDate: null,
      eventEndDate: null,
    },
    images: [],
    tags: [],
  };

  const handleCheckboxChange = async (e) => {
    const isChecked = e.target.checked;
    setUseOtherCity(isChecked);

    if (isChecked) {

      setPreviousRegion(selectedRegion);
      setPreviousSubregion(selectedSubregion);
      setPreviousTown(selectedTown);
      setPreviousStreet(values.street);

      setValues((prevValues) => ({
        ...prevValues,
        adRegion: "",
        adSubregion: "",
        adTown: "",
        street: "",
      }));
      setSelectedRegion("");
      setSelectedSubregion("");
      setSelectedTown("");

    } else {
      setSelectedRegion(previousRegion);
      setSelectedSubregion(previousSubregion);
      setSelectedTown(previousTown);

      setValues((prevValues) => ({
        ...prevValues,
        adRegion: previousRegion,
        adSubregion: previousSubregion,
        adTown: previousTown,
        street: previousStreet, 
      }));

      if (previousRegion) {
        await fetchSubregions(previousRegion);
      }
      if (previousRegion && previousSubregion) {
        await fetchTowns(previousRegion, previousSubregion);
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });

  }, []);

  useEffect(() => {
    const loadAdDetails = async () => {
      try {
        const response = await getAdById(adId);

        if (!response || !response.ads) {
          throw new Error("No ad details returned");
        }

        const adDetails = response.ads;

        setValues({
          ...initialValues,
          adId: adDetails.adId || "",
          summary: adDetails.summary || "",
          category: adDetails.category || "",
          description: adDetails.description || "",
          adRegion: adDetails.adRegion || "",
          adSubregion: adDetails.adSubregion || "",
          adTown: adDetails.adTown || "",
          street: adDetails.street || "",
          useOtherCity: adDetails.useOtherCity || false,
          extraFields: {
            price: adDetails.extraFields?.price || undefined,
            eventStartDate: adDetails.extraFields?.eventStartDate
              ? new Date(adDetails.extraFields.eventStartDate)
              : null,
            eventEndDate: adDetails.extraFields?.eventEndDate
              ? new Date(adDetails.extraFields.eventEndDate)
              : null,
          },
          images: adDetails.images || [],
          tags: adDetails.tags || [],
        });

        let imageUrls = adDetails.images.map((obj) => obj.imageURL);
        while (imageUrls.length < 4) {
          imageUrls.push(null);
        }
        setImages(imageUrls);

        setSelectedRegion(adDetails.adRegion || "");
        setSelectedSubregion(adDetails.adSubregion || "");
        setSelectedTown(adDetails.adTown || "");
        setTags(adDetails.tags || []);
      } catch (error) {
        console.error("Failed to load ad details", error);
      }
    };

    if (adId) {
      loadAdDetails();
    }
  }, [adId]);

  useEffect(() => {
    if (selectedRegion) {
      fetchSubregions(selectedRegion);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedRegion && selectedSubregion) {
      fetchTowns(selectedRegion, selectedSubregion).then(setSettlements);
    }
  }, [selectedRegion, selectedSubregion]);

  useEffect(() => {
    const loadFieldDefinitions = async () => {
      try {
        const response = await fetch("/fieldDefinitions.json");
        const data = await response.json();
        setFieldDefinitions(data);
      } catch (error) {
        console.error("Failed to load field definitions", error);
      }
    };

    loadFieldDefinitions();
  }, []);

  const handleNavigate = () => navigate("/profile/announced");

  const formatDateToYYYYMMDD = (date) => {
    if (!date) {
      const fields = fieldDefinitions.fields?.[values.category] || [];
      if (fields.some((field) => field.type === "date")) return null;
      else return undefined;
    }
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  const formatPrice = (price) => {
    if (!price) {
      const fields = fieldDefinitions.fields?.[values.category] || [];
      if (fields.some((field) => field.name === "price")) return null;
      else return undefined;
    }
    return price;
  };

  const {
    onChangeHandler,
    onBlurHandler,
    values,
    onSubmit,
    setValues,
    errors,
    images,
    setImages,
    handleImageChange,
    handleRemoveImage,
  } = useFormCreate(
    initialValues,
    async (formData) => {
      const updatedFormData = {
        ...formData,
        adRegion: selectedRegion || profileData.details.region,
        adSubregion: selectedSubregion || profileData.details.subregion,
        adTown: selectedTown || profileData.details.settlement,
        tags,
        extraFields: {
          ...formData.extraFields,
          price: formatPrice(formData.extraFields.price),
          eventStartDate: formatDateToYYYYMMDD(
            formData.extraFields.eventStartDate
          ),
          eventEndDate: formatDateToYYYYMMDD(formData.extraFields.eventEndDate),
        },
      };

      try {
        await editAd(updatedFormData);
        navigate("/profile/announced");
      } catch (error) {
        console.error("Error updating ad:", error);
      }
    },
    emailPrefix
  );

  const renderFields = () => {
    const fields = fieldDefinitions.fields?.[values.category] || [];
    return fields.length > 0 ? (
      <div className="additional-fields-price">
        {fields.map((field, index) => (
          <div key={index} className="form-group">
            <label htmlFor={field.name}>{t(`ads.${field.subname}`)}</label>
            {field.type === "date" ? (
              <DatePicker
                selected={values.extraFields[field.name]}
                onChange={(date) =>
                  setValues((state) => ({
                    ...state,
                    extraFields: { ...state.extraFields, [field.name]: date },
                  }))
                }
                onBlur={onBlurHandler}
                dateFormat="yyyy-MM-dd"
                id={field.name}
                name={field.name}
                required={field.required}
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={values.extraFields[field.name] || ""}
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
            {errors.extraFields && errors.extraFields[field.name] && (
              <p className="error">{errors.extraFields[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    ) : null;
  };

  return (
    <>
      <section className="ad-community-background">
        <HeaderCommunity />
        <section className="create-ad-main">
          <div className="ad-card-create">
            <h2 className="ad--card-title">{t("ads.edit_ad")}</h2>
            <div className="ad-create-form">
              <form onSubmit={onSubmit}>
                <div className="ad-info-desc">
                  <div className="form-group">
                    <label htmlFor="summary">{t("ads.summary")}</label>
                    <input
                      type="text"
                      id="summary"
                      name="summary"
                      value={values.summary}
                      onChange={onChangeHandler}
                      onBlur={onBlurHandler}
                      required
                    />
                    <p className="desc-sub-text">{t("ads.sub_text-one")}</p>
                    {errors.summary && (
                      <p className="error">{errors.summary}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">{t("ads.category_ad")}</label>
                    <select
                      id="category"
                      name="category"
                      value={values.category}
                      onChange={onChangeHandler}
                      onBlur={onBlurHandler}
                    >
                      {searchCriteria.searchCriteria?.map((criteria) => (
                        <option key={criteria.value} value={criteria.value}>
                          {t(criteria.name)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="error">{errors.category}</p>
                    )}
                  </div>
                </div>
                {renderFields()}
                <div className="form-group">
                  <label htmlFor="description">{t("ads.description")}</label>
                  <textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={onChangeHandler}
                    onBlur={onBlurHandler}
                    required
                  />
                  <p className="desc-sub-text">{t("ads.sub_text-two")}</p>
                  {errors.description && (
                    <p className="error">{errors.description}</p>
                  )}
                </div>
                <TagInput tags={tags} setTags={setTags} t={t} />
                <div className="address-check">
                  <div className="ad-address">
                    <div className="ad-regions">
                      <div className="form-group">
                        <label htmlFor="adRegion">{t("ads.ad_region")}</label>
                        <select
                          id="adRegion"
                          name="adRegion"
                          value={selectedRegion}
                          onChange={(e) => {
                            const newRegion = e.target.value;
                            setSelectedRegion(newRegion);

                            if (useOtherCity) {
                              setSelectedSubregion("");
                              setSelectedTown("");

                              setValues((prevValues) => ({
                                ...prevValues,
                                adRegion: newRegion,
                                adSubregion: "",
                                adTown: "",
                              }));
                              if (newRegion) {
                                fetchSubregions(newRegion);
                              }
                            } else {

                              setValues((prevValues) => ({
                                ...prevValues,
                                adRegion: newRegion,
                              }));
                            }
                          }}
                          onBlur={onBlurHandler}
                          required
                          disabled={!useOtherCity}
                        >
                          <option value="">
                            {t("community.select_region")}
                          </option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {currentLanguage === "bg" ? region.bg : region.en}
                            </option>
                          ))}
                        </select>
                        {errors.adRegion && (
                          <p className="error">{errors.adRegion}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="adSubregion">
                          {t("ads.ad_municipality")}
                        </label>
                        <select
                          id="adSubregion"
                          name="adSubregion"
                          value={selectedSubregion}
                          onChange={(e) => {
                            const newSubregion = e.target.value;
                            setSelectedSubregion(newSubregion);
                            setValues((state) => ({
                              ...state,
                              adSubregion: newSubregion,
                              adTown: state.adTown,
                            }));
                            if (!useOtherCity) {
                              setSelectedTown("");
                            }
                          }}
                          onBlur={onBlurHandler}
                          required
                          disabled={!useOtherCity}
                        >
                          <option value="">
                            {t("community.select_municipality")}
                          </option>
                          {selectedRegion &&
                            subregions[selectedRegion]?.map((subregion) => (
                              <option key={subregion.id} value={subregion.id}>
                                {currentLanguage === "bg"
                                  ? subregion.bg
                                  : subregion.en}
                              </option>
                            ))}
                        </select>
                        {errors.adSubregion && (
                          <p className="error">{errors.adSubregion}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="adTown">{t("ads.ad_town")}</label>
                        <select
                          id="adTown"
                          name="adTown"
                          value={selectedTown}
                          onChange={(e) => {
                            setSelectedTown(e.target.value);
                            setValues((state) => ({
                              ...state,
                              adTown: e.target.value,
                            }));
                          }}
                          onBlur={onBlurHandler}
                          required
                          disabled={!useOtherCity}
                        >
                          <option value="">{t("ads.select_town")}</option>
                          {selectedSubregion &&
                            settlements.map((town) => (
                              <option key={town.id} value={town.id}>
                                {currentLanguage === "bg" ? town.bg : town.en}
                              </option>
                            ))}
                        </select>
                        {errors.adTown && (
                          <p className="error">{errors.adTown}</p>
                        )}
                      </div>
                    </div>
                    <div className="checkbox-group useOtherCity">
                      <input
                        type="checkbox"
                        id="useOtherCity"
                        name="useOtherCity"
                        checked={useOtherCity}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="useOtherCity">
                        {t("ads.use_other_city")}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="street">{t("ads.ad_address")}</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={values.street}
                      onChange={onChangeHandler}
                      onBlur={onBlurHandler}
                      disabled={!useOtherCity}
                      required
                    />
                    {errors.street && <p className="error">{errors.street}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("ads.add_photos")}</label>
                  <div className="image-upload-container">
                    {images.map((image, index) => (
                      <div key={index} className="image-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          data-index={index}
                          multiple
                        />
                        {image ? (
                          <>
                            <img src={image} alt={`Upload ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </>
                        ) : (
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="plus-icon-ad"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="button-group">
                  <button type="submit" className="publish-button">
                    {t("ads.edit")}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleNavigate}
                  >
                    {t("ads.cancel_btn")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        <CommunityFooter />
      </section>
    </>
  );
};
