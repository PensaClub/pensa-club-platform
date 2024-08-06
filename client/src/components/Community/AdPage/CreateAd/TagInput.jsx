import { useState } from 'react';
import './tagInput.css';

export const TagInput = ({ tags, setTags, t }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && inputValue && !tags.includes(inputValue)) {
            e.preventDefault();
            if (tags.length < 5) {
                setTags([...tags, inputValue]);
                setInputValue('');
            } else {
                alert('You can only add up to 5 tags.');// notifi
            }
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="tag-input-container">
            <label htmlFor="tags">{t('ads.tags')}</label>
            <p className="desc-sub-text"><span>{t('ads.tags_ad')}</span></p>

            <input
                id="tags"
                name="tags"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length >= 5 ? t('ads.max_tags') : t('ads.enter_tag')}
                disabled={tags.length >= 5}
            />
            <div className="tags">
                {tags.map((tag, index) => (
                    <div key={index} className="tag">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(index)}>x</button>
                    </div>
                ))}

            </div>
            {tags.length >= 5 && (<p className="error">{t('ads.max_tags')}</p>)}

        </div>
    );
};

