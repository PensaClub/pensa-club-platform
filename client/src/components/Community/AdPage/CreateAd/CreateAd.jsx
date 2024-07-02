import './createAd.css';
import '../../communityPage.css';
import { CommunityFooter } from '../../CommunityFooter/CommunityFooter';
import { HeaderCommunity } from '../../HeaderCommunity/HeaderCommunity';
import '../../CommunityFooter/communityFooter.css';
import { useCommunityContext } from '../../../contexts/CommunityContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useFormCreate } from '../../../hooks/useFormCreate';
import { useTranslation } from 'react-i18next';


export const CreateAd = () => {
    const { t } = useTranslation();
    const { searchCriteria } = useCommunityContext();

    const initialValues = {
        summary: '',
        category: 'Дарявам',
        description: '',
        adTown: '',
        adAddress: '',
        useOtherCity: false
    };

    const { onChangeHandler, onBlurHandler, values, onSubmit, setValues, errors, images, handleImageChange } = useFormCreate(initialValues, (formData, images) => {

        console.log('Form Data:', formData);
        console.log('Images:', images);
    });

    return (
        <>
            <section className="ad-community-background">
                <HeaderCommunity />

                <section className="create-ad-main">
                    <div className="ad-card-create">
                        <h2 className="ad--card-title">Публикувай обява</h2>

                        <div className="ad-create-form">
                            <form onSubmit={onSubmit}>
                                <div className="ad-info-desc">
                                    <div className="form-group">
                                        <label htmlFor="summary">Име на обявата</label>
                                        <input
                                            type="text"
                                            id="summary"
                                            name="summary"
                                            value={values.adTitle}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            required
                                        />
                                        {errors.adTitle && <p className="error">{errors.adTitle}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="category">Категория</label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={values.category}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                        >
                                            {searchCriteria.searchCriteria?.map((criteria) => (
                                                <option key={criteria.id} value={criteria.value}>
                                                    {t(criteria.name)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="error">{errors.category}</p>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Описание</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={values.description}
                                        onChange={onChangeHandler}
                                        onBlur={onBlurHandler}
                                        required
                                    />
                                    {errors.description && <p className="error">{errors.description}</p>}
                                </div>
                                <div className="ad-address">
                                    <div className="form-group">
                                        <label htmlFor="adTown">Град</label>
                                        <input
                                            type="text"
                                            id="adTown"
                                            name="adTown"
                                            value={values.city}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            required
                                            disabled={values.useOtherCity}
                                        />
                                        {errors.city && <p className="error">{errors.city}</p>}
                                    </div>
                                    <div className="checkbox-group useOtherCity">
                                        <input
                                            type="checkbox"
                                            id="useOtherCity"
                                            name="useOtherCity"
                                            checked={values.useOtherCity}
                                            onChange={(e) => setValues((state) => ({ ...state, useOtherCity: e.target.checked }))}
                                        />
                                        <label htmlFor="useOtherCity">Искам да избера друг град</label>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="adAddress">Адрес</label>
                                        <input
                                            type="text"
                                            id="adAddress"
                                            name="adAddress"
                                            value={values.address}
                                            onChange={onChangeHandler}
                                            onBlur={onBlurHandler}
                                            required
                                        />
                                        {errors.address && <p className="error">{errors.address}</p>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Добави снимки</label>
                                    <div className="image-upload-container">
                                        {images.map((image, index) => (
                                            <div key={index} className="image-upload">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(index, e)}
                                                />
                                                {image ? (
                                                    <img src={image.url} alt={`Upload ${index + 1}`} />
                                                ) : (
                                                    <FontAwesomeIcon icon={faPlus} className="plus-icon-ad" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="button-group">
                                    <button type="submit" className="publish-button">Публикувай</button>
                                    <button type="button" className="cancel-button" onClick={() => { /* Logic for cancel */ }}>Откажи</button>
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
