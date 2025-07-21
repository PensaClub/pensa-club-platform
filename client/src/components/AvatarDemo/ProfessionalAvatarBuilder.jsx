import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../contexts/UserContext';
import { notify } from '../../utils/notify';
import './professionalAvatarBuilder.css';

export const ProfessionalAvatarBuilder = () => {
  const { t } = useTranslation();
  const { onEditProfileDataSubmit, profileData } = useContext(UserContext);
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState({
    avatarStyle: 'Circle',
    topType: 'LongHairStraight',
    hairColor: 'BrownDark',
    accessoriesType: 'Prescription02',
    facialHairType: 'Blank',
    facialHairColor: 'BrownDark',
    clotheType: 'Hoodie',
    clotheColor: 'Black',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light'
  });

  const topTypes = [
    { value: 'NoHair', label: t('avatar.hair.noHair') },
    { value: 'LongHairStraight', label: t('avatar.hair.longStraight') },
    { value: 'LongHairCurly', label: t('avatar.hair.longCurly') },
    { value: 'LongHairBob', label: t('avatar.hair.bob') },
    { value: 'LongHairBun', label: t('avatar.hair.bun') },
    { value: 'LongHairCurvy', label: t('avatar.hair.curvy') },
    { value: 'LongHairDreads', label: t('avatar.hair.dreads') },
    { value: 'LongHairFrida', label: t('avatar.hair.frida') },
    { value: 'ShortHairShortFlat', label: t('avatar.hair.shortFlat') },
    { value: 'ShortHairShortCurly', label: t('avatar.hair.shortCurly') },
    { value: 'ShortHairShortWaved', label: t('avatar.hair.shortWaved') },
    { value: 'ShortHairSides', label: t('avatar.hair.sides') },
    { value: 'ShortHairTheCaesar', label: t('avatar.hair.caesar') },
    { value: 'ShortHairDreads01', label: t('avatar.hair.shortDreads') }
  ];

  const accessoriesTypes = [
    { value: 'Blank', label: t('avatar.accessories.none') },
    { value: 'Kurt', label: t('avatar.accessories.kurt') },
    { value: 'Prescription01', label: t('avatar.accessories.prescription1') },
    { value: 'Prescription02', label: t('avatar.accessories.prescription2') },
    { value: 'Round', label: t('avatar.accessories.round') },
    { value: 'Sunglasses', label: t('avatar.accessories.sunglasses') },
    { value: 'Wayfarers', label: t('avatar.accessories.wayfarers') }
  ];

  const facialHairTypes = [
    { value: 'Blank', label: t('avatar.beard.none') },
    { value: 'BeardMedium', label: t('avatar.beard.medium') },
    { value: 'BeardLight', label: t('avatar.beard.light') },
    { value: 'BeardMajestic', label: t('avatar.beard.majestic') },
    { value: 'MoustacheFancy', label: t('avatar.beard.moustacheFancy') },
    { value: 'MoustacheMagnum', label: t('avatar.beard.moustacheMagnum') }
  ];

  const eyeTypes = [
    { value: 'Default', label: t('avatar.eyes.normal') },
    { value: 'Happy', label: t('avatar.eyes.happy') },
    { value: 'Hearts', label: t('avatar.eyes.hearts') },
    { value: 'Wink', label: t('avatar.eyes.wink') },
    { value: 'WinkWacky', label: t('avatar.eyes.winkWacky') },
    { value: 'Surprised', label: t('avatar.eyes.surprised') },
    { value: 'Cry', label: t('avatar.eyes.cry') },
    { value: 'Close', label: t('avatar.eyes.close') },
    { value: 'Squint', label: t('avatar.eyes.squint') }
  ];

  const mouthTypes = [
    { value: 'Default', label: t('avatar.mouth.normal') },
    { value: 'Smile', label: t('avatar.mouth.smile') },
    { value: 'Serious', label: t('avatar.mouth.serious') },
    { value: 'Eating', label: t('avatar.mouth.eating') },
    { value: 'Concerned', label: t('avatar.mouth.concerned') },
    { value: 'Disbelief', label: t('avatar.mouth.disbelief') },
    { value: 'Grimace', label: t('avatar.mouth.grimace') },
    { value: 'Sad', label: t('avatar.mouth.sad') },
    { value: 'ScreamOpen', label: t('avatar.mouth.scream') },
    { value: 'Tongue', label: t('avatar.mouth.tongue') },
    { value: 'Twinkle', label: t('avatar.mouth.twinkle') },
    { value: 'Vomit', label: t('avatar.mouth.vomit') }
  ];

  const skinColors = [
    { value: 'Light', label: t('avatar.skin.light'), color: '#FDBCB4' },
    { value: 'Tanned', label: t('avatar.skin.tanned'), color: '#D08B5B' },
    { value: 'Yellow', label: t('avatar.skin.yellow'), color: '#F8D25C' },
    { value: 'Brown', label: t('avatar.skin.brown'), color: '#AE5D29' },
    { value: 'DarkBrown', label: t('avatar.skin.darkBrown'), color: '#8D5524' },
    { value: 'Black', label: t('avatar.skin.black'), color: '#614335' }
  ];

  const hairColors = [
    { value: 'Black', label: t('avatar.hairColors.black'), color: '#000000' },
    { value: 'Brown', label: t('avatar.hairColors.brown'), color: '#8B4513' },
    { value: 'BrownDark', label: t('avatar.hairColors.darkBrown'), color: '#5D4037' },
    { value: 'Blonde', label: t('avatar.hairColors.blonde'), color: '#FFD700' },
    { value: 'BlondeGolden', label: t('avatar.hairColors.goldenBlonde'), color: '#FFA500' },
    { value: 'Red', label: t('avatar.hairColors.red'), color: '#FF4500' },
    { value: 'Auburn', label: t('avatar.hairColors.auburn'), color: '#A52A2A' },
    { value: 'PastelPink', label: t('avatar.hairColors.pastelPink'), color: '#FFB6C1' },
    { value: 'Blue', label: t('avatar.hairColors.blue'), color: '#4169E1' },
    { value: 'Platinum', label: t('avatar.hairColors.platinum'), color: '#E5E4E2' }
  ];

  const generateAvatarURL = () => {
    const params = new URLSearchParams({
      avatarStyle: config.avatarStyle,
      topType: config.topType,
      accessoriesType: config.accessoriesType,
      hairColor: config.hairColor,
      facialHairType: config.facialHairType,
      facialHairColor: config.facialHairColor,
      clotheType: config.clotheType,
      clotheColor: config.clotheColor,
      eyeType: config.eyeType,
      eyebrowType: config.eyebrowType,
      mouthType: config.mouthType,
      skinColor: config.skinColor
    });

    return `https://avataaars.io/?${params.toString()}`;
  };

  const handleSaveAvatar = async () => {
    setIsSaving(true);
    try {
      const avatarURL = generateAvatarURL();
      await onEditProfileDataSubmit({
        imageURL: avatarURL,
        avatarConfig: config
      });
      notify('success', t('avatar.saveSuccess'));
    } catch (error) {
      notify('error', t('avatar.saveError'));
      console.error('Error saving avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRandomize = () => {
    setConfig({
      ...config,
      topType: topTypes[Math.floor(Math.random() * topTypes.length)].value,
      accessoriesType: accessoriesTypes[Math.floor(Math.random() * accessoriesTypes.length)].value,
      facialHairType: facialHairTypes[Math.floor(Math.random() * facialHairTypes.length)].value,
      eyeType: eyeTypes[Math.floor(Math.random() * eyeTypes.length)].value,
      mouthType: mouthTypes[Math.floor(Math.random() * mouthTypes.length)].value,
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)].value,
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)].value
    });
  };

  const getHairIcon = (type) => {
    switch (type) {
      case 'NoHair': return '🦲';
      case 'LongHairStraight': return '👩‍🦱';
      case 'LongHairCurly': return '👩‍🦲';
      case 'LongHairBob': return '💇‍♀️';
      case 'LongHairBun': return '👰';
      case 'LongHairCurvy': return '🧝‍♀️';
      case 'LongHairDreads': return '🧑‍🎤';
      case 'LongHairFrida': return '👸';
      case 'ShortHairShortFlat': return '👨‍💼';
      case 'ShortHairShortCurly': return '👨‍🦱';
      case 'ShortHairShortWaved': return '🧑‍💻';
      case 'ShortHairSides': return '👨‍🚀';
      case 'ShortHairTheCaesar': return '🏛️';
      case 'ShortHairDreads01': return '🎸';
      default: return '💇';
    }
  };

  const getEyeIcon = (type) => {
    switch (type) {
      case 'Happy': return '😊';
      case 'Hearts': return '😍';
      case 'Wink': return '😉';
      case 'WinkWacky': return '🤪';
      case 'Surprised': return '😲';
      case 'Cry': return '😢';
      case 'Close': return '😴';
      case 'Squint': return '😑';
      default: return '👁️';
    }
  };

  const getMouthIcon = (type) => {
    switch (type) {
      case 'Smile': return '😊';
      case 'Serious': return '😐';
      case 'Eating': return '😋';
      case 'Concerned': return '😟';
      case 'Disbelief': return '😒';
      case 'Grimace': return '😬';
      case 'Sad': return '😢';
      case 'ScreamOpen': return '😱';
      case 'Tongue': return '😛';
      case 'Twinkle': return '😌';
      case 'Vomit': return '🤢';
      default: return '😐';
    }
  };

  const getGlassesIcon = (type) => {
    switch (type) {
      case 'Blank': return '👤';
      case 'Kurt': return '🤓';
      case 'Prescription01': return '👓';
      case 'Prescription02': return '👓';
      case 'Round': return '🧐';
      case 'Sunglasses': return '🕶️';
      case 'Wayfarers': return '😎';
      default: return '👤';
    }
  };

  const getBeardIcon = (type) => {
    switch (type) {
      case 'Blank': return '😊';
      case 'BeardMedium': return '🧔';
      case 'BeardLight': return '🧔‍♂️';
      case 'BeardMajestic': return '🧙‍♂️';
      case 'MoustacheFancy': return '🥸';
      case 'MoustacheMagnum': return '👨‍✈️';
      default: return '😊';
    }
  };

  return (
    <div className="avatar-builder-container">
      <div className="avatar-builder-header">
        <h2>🎨 {t('avatar.title')}</h2>
        <p>{t('avatar.subtitle')}</p>
      </div>

      <div className="avatar-builder-layout">
        {/* Лява страна - Аватар Preview (Sticky) */}
        <div className="avatar-preview-panel">
          <div className="avatar-preview-sticky">
            <div className="current-avatar">
              <img
                src={generateAvatarURL()}
                alt="Avatar Preview"
                className={`avatar-preview-image ${config.avatarStyle === 'Transparent' ? 'square' : ''}`}
              />
            </div>

            {/* Опростени стил опции */}
            <div className="avatar-background-section">
              <h4>🎨 {t('avatar.backgroundStyle')}</h4>
              <div className="background-toggle">
                <label className={`background-option ${config.avatarStyle === 'Transparent' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="avatarStyle"
                    checked={config.avatarStyle === 'Transparent'}
                    onChange={() => setConfig({ ...config, avatarStyle: 'Transparent' })}
                  />
                  {t('avatar.noBackground')}
                </label>
                <label className={`background-option ${config.avatarStyle === 'Circle' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="avatarStyle"
                    checked={config.avatarStyle === 'Circle'}
                    onChange={() => setConfig({ ...config, avatarStyle: 'Circle' })}
                  />
                  {t('avatar.withBackground')}
                </label>
              </div>
            </div>

            <div className="avatar-actions">
              <button
                onClick={handleRandomize}
                className="btn-secondary"
              >
                🎲 {t('avatar.random')}
              </button>

              <button
                onClick={handleSaveAvatar}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? `💾 ${t('avatar.saving')}...` : `💾 ${t('avatar.save')}`}
              </button>
            </div>
          </div>
        </div>

        {/* Дясна страна - Контроли */}
        <div className="avatar-controls-panel">
          <div className="controls-scroll">
            {/* Прическа - сега със същия стил като другите */}
            <div className="control-section">
              <h3>💇‍♀️ {t('avatar.hair.title')}</h3>
              <div className="control-grid-with-labels">
                {topTypes.map(type => (
                  <div key={type.value} className="control-item">
                    <button
                      className={`control-btn-icon ${config.topType === type.value ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, topType: type.value })}
                      aria-label={type.label}
                    >
                      {getHairIcon(type.value)}
                    </button>
                    <span className="control-label">{type.label}</span>
                  </div>
                ))}
              </div>

              <div className="color-section-compact">
                <h4>{t('avatar.hairColor')}</h4>
                <div className="color-dots-grid">
                  {hairColors.map(color => (
                    <button
                      key={color.value}
                      className={`color-dot ${config.hairColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.color }}
                      onClick={() => setConfig({ ...config, hairColor: color.value })}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Очи */}
            <div className="control-section">
              <h3>👁️ {t('avatar.eyes.title')}</h3>
              <div className="control-grid-with-labels">
                {eyeTypes.map(type => (
                  <div key={type.value} className="control-item">
                    <button
                      className={`control-btn-icon ${config.eyeType === type.value ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, eyeType: type.value })}
                      aria-label={type.label}
                    >
                      {getEyeIcon(type.value)}
                    </button>
                    <span className="control-label">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Уста */}
            <div className="control-section">
              <h3>😊 {t('avatar.mouth.title')}</h3>
              <div className="control-grid-with-labels">
                {mouthTypes.map(type => (
                  <div key={type.value} className="control-item">
                    <button
                      className={`control-btn-icon ${config.mouthType === type.value ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, mouthType: type.value })}
                      aria-label={type.label}
                    >
                      {getMouthIcon(type.value)}
                    </button>
                    <span className="control-label">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Очила */}
            <div className="control-section">
              <h3>🤓 {t('avatar.accessories.title')}</h3>
              <div className="control-grid-with-labels">
                {accessoriesTypes.map(type => (
                  <div key={type.value} className="control-item">
                    <button
                      className={`control-btn-icon ${config.accessoriesType === type.value ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, accessoriesType: type.value })}
                      aria-label={type.label}
                    >
                      {getGlassesIcon(type.value)}
                    </button>
                    <span className="control-label">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Брада */}
            <div className="control-section">
              <h3>🧔 {t('avatar.beard.title')}</h3>
              <div className="control-grid-with-labels">
                {facialHairTypes.map(type => (
                  <div key={type.value} className="control-item">
                    <button
                      className={`control-btn-icon ${config.facialHairType === type.value ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, facialHairType: type.value })}
                      aria-label={type.label}
                    >
                      {getBeardIcon(type.value)}
                    </button>
                    <span className="control-label">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Кожа */}
            <div className="control-section">
              <h3>🎨 {t('avatar.skinColor')}</h3>
              <div className="color-dots-grid">
                {skinColors.map(color => (
                  <button
                    key={color.value}
                    className={`color-dot ${config.skinColor === color.value ? 'active' : ''}`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => setConfig({ ...config, skinColor: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};