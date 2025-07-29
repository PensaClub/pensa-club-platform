import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../contexts/UserContext';
import { notify } from '../../utils/notify.jsx';
import './professionalAvatarBuilder.css';

export const ProfessionalAvatarBuilder = () => {
  const { t } = useTranslation();
  const { onEditProfileDataSubmit, profileData } = useContext(UserContext);
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState({
    avatarStyle: 'Circle',
    topType: 'LongHairStraight',
    hairColor: 'BrownDark',
    hatColor: 'Blue01',
    accessoriesType: 'Prescription02',
    facialHairType: 'Blank',
    facialHairColor: 'BrownDark',
    clotheType: 'BlazerShirt',
    clotheColor: 'Blue01',
    graphicType: 'Bat', // За GraphicShirt
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light'
  });

  // Прически и шапки
  const topTypes = [
    { value: 'NoHair', label: t('avatar.hair.noHair') },
    { value: 'Eyepatch', label: t('avatar.hair.eyepatch') },
    { value: 'Hat', label: t('avatar.hair.hat') },
    { value: 'Hijab', label: t('avatar.hair.hijab') },
    { value: 'Turban', label: t('avatar.hair.turban') },
    { value: 'WinterHat1', label: t('avatar.hair.winterHat1') },
    { value: 'WinterHat2', label: t('avatar.hair.winterHat2') },
    { value: 'WinterHat3', label: t('avatar.hair.winterHat3') },
    { value: 'WinterHat4', label: t('avatar.hair.winterHat4') },
    { value: 'LongHairBigHair', label: t('avatar.hair.longBigHair') },
    { value: 'LongHairBob', label: t('avatar.hair.bob') },
    { value: 'LongHairBun', label: t('avatar.hair.bun') },
    { value: 'LongHairCurly', label: t('avatar.hair.longCurly') },
    { value: 'LongHairCurvy', label: t('avatar.hair.curvy') },
    { value: 'LongHairDreads', label: t('avatar.hair.dreads') },
    { value: 'LongHairFrida', label: t('avatar.hair.frida') },
    { value: 'LongHairFro', label: t('avatar.hair.fro') },
    { value: 'LongHairFroBand', label: t('avatar.hair.froBand') },
    { value: 'LongHairNotTooLong', label: t('avatar.hair.notTooLong') },
    { value: 'LongHairShavedSides', label: t('avatar.hair.shavedSides') },
    { value: 'LongHairMiaWallace', label: t('avatar.hair.miaWallace') },
    { value: 'LongHairStraight', label: t('avatar.hair.longStraight') },
    { value: 'LongHairStraight2', label: t('avatar.hair.longStraight2') },
    { value: 'LongHairStraightStrand', label: t('avatar.hair.straightStrand') },
    { value: 'ShortHairDreads01', label: t('avatar.hair.shortDreads1') },
    { value: 'ShortHairDreads02', label: t('avatar.hair.shortDreads2') },
    { value: 'ShortHairFrizzle', label: t('avatar.hair.frizzle') },
    { value: 'ShortHairShaggyMullet', label: t('avatar.hair.shaggyMullet') },
    { value: 'ShortHairShortCurly', label: t('avatar.hair.shortCurly') },
    { value: 'ShortHairShortFlat', label: t('avatar.hair.shortFlat') },
    { value: 'ShortHairShortRound', label: t('avatar.hair.shortRound') },
    { value: 'ShortHairShortWaved', label: t('avatar.hair.shortWaved') },
    { value: 'ShortHairSides', label: t('avatar.hair.sides') },
    { value: 'ShortHairTheCaesar', label: t('avatar.hair.caesar') },
    { value: 'ShortHairTheCaesarSidePart', label: t('avatar.hair.caesarSidePart') }
  ];

  // Дрехи
  const clotheTypes = [
    { value: 'BlazerShirt', label: t('avatar.clothes.blazerShirt') },
    { value: 'BlazerSweater', label: t('avatar.clothes.blazerSweater') },
    { value: 'CollarSweater', label: t('avatar.clothes.collarSweater') },
    { value: 'GraphicShirt', label: t('avatar.clothes.graphicShirt') },
    { value: 'Hoodie', label: t('avatar.clothes.hoodie') },
    { value: 'Overall', label: t('avatar.clothes.overall') },
    { value: 'ShirtCrewNeck', label: t('avatar.clothes.shirtCrewNeck') },
    { value: 'ShirtScoopNeck', label: t('avatar.clothes.shirtScoopNeck') },
    { value: 'ShirtVNeck', label: t('avatar.clothes.shirtVNeck') }
  ];

  // Графики за GraphicShirt
  const graphicTypes = [
    { value: 'Bat', label: t('avatar.graphics.bat') },
    { value: 'Cumbia', label: t('avatar.graphics.cumbia') },
    { value: 'Deer', label: t('avatar.graphics.deer') },
    { value: 'Diamond', label: t('avatar.graphics.diamond') },
    { value: 'Hola', label: t('avatar.graphics.hola') },
    { value: 'Pizza', label: t('avatar.graphics.pizza') },
    { value: 'Resist', label: t('avatar.graphics.resist') },
    { value: 'Selena', label: t('avatar.graphics.selena') },
    { value: 'Bear', label: t('avatar.graphics.bear') },
    { value: 'SkullOutline', label: t('avatar.graphics.skullOutline') },
    { value: 'Skull', label: t('avatar.graphics.skull') }
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

  // Повече варианти за брада
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
    { value: 'Squint', label: t('avatar.eyes.squint') },
    { value: 'Dizzy', label: t('avatar.eyes.dizzy') },
    { value: 'EyeRoll', label: t('avatar.eyes.eyeRoll') },
    { value: 'Side', label: t('avatar.eyes.side') }
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

  // Цветове за коса/шапки
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
    { value: 'Platinum', label: t('avatar.hairColors.platinum'), color: '#E5E4E2' },
    { value: 'Gray', label: t('avatar.hairColors.gray'), color: '#808080' },
    { value: 'SilverGray', label: t('avatar.hairColors.silverGray'), color: '#C0C0C0' },
    { value: 'White', label: t('avatar.hairColors.white'), color: '#FFFFFF' }
  ];

  // Цветове за дрехи
  const clotheColors = [
    { value: 'Black', label: t('avatar.clotheColors.black'), color: '#000000' },
    { value: 'Blue01', label: t('avatar.clotheColors.blue1'), color: '#3C4F5C' },
    { value: 'Blue02', label: t('avatar.clotheColors.blue2'), color: '#5199E4' },
    { value: 'Blue03', label: t('avatar.clotheColors.blue3'), color: '#25557C' },
    { value: 'Gray01', label: t('avatar.clotheColors.gray1'), color: '#E6E6FA' },
    { value: 'Gray02', label: t('avatar.clotheColors.gray2'), color: '#929598' },
    { value: 'Heather', label: t('avatar.clotheColors.heather'), color: '#3C4F5C' },
    { value: 'PastelBlue', label: t('avatar.clotheColors.pastelBlue'), color: '#B1E2FF' },
    { value: 'PastelGreen', label: t('avatar.clotheColors.pastelGreen'), color: '#A7FFC4' },
    { value: 'PastelOrange', label: t('avatar.clotheColors.pastelOrange'), color: '#FFDEB5' },
    { value: 'PastelRed', label: t('avatar.clotheColors.pastelRed'), color: '#FFBABA' },
    { value: 'PastelYellow', label: t('avatar.clotheColors.pastelYellow'), color: '#180011ff' },
    { value: 'Pink', label: t('avatar.clotheColors.pink'), color: '#FF488E' },
    { value: 'Red', label: t('avatar.clotheColors.red'), color: '#FF5A5A' },
    { value: 'White', label: t('avatar.clotheColors.white'), color: '#FFFFFF' }
  ];

  const generateAvatarURL = () => {
    const params = new URLSearchParams({
      avatarStyle: config.avatarStyle,
      topType: config.topType,
      accessoriesType: config.accessoriesType,
      facialHairType: config.facialHairType,
      facialHairColor: config.facialHairColor,
      clotheType: config.clotheType,
      clotheColor: config.clotheColor,
      eyeType: config.eyeType,
      eyebrowType: config.eyebrowType,
      mouthType: config.mouthType,
      skinColor: config.skinColor
    });

    // За шапки използваме hatColor, за коса - hairColor
    const hatTypes = ['Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4'];
    if (hatTypes.includes(config.topType)) {
      params.append('hatColor', config.hatColor);
    } else if (!isNoColorHairType(config.topType)) {
      // Само ако прическата поддържа цветове
      params.append('hairColor', config.hairColor);
    }

    // За GraphicShirt добавяме graphicType
    if (config.clotheType === 'GraphicShirt') {
      params.append('graphicType', config.graphicType);
    }

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
    const newTopType = topTypes[Math.floor(Math.random() * topTypes.length)].value;
    const newClotheType = clotheTypes[Math.floor(Math.random() * clotheTypes.length)].value;
    
    setConfig({
      ...config,
      topType: newTopType,
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)].value,
      hatColor: hairColors[Math.floor(Math.random() * hairColors.length)].value,
      accessoriesType: accessoriesTypes[Math.floor(Math.random() * accessoriesTypes.length)].value,
      facialHairType: facialHairTypes[Math.floor(Math.random() * facialHairTypes.length)].value,
      facialHairColor: hairColors[Math.floor(Math.random() * hairColors.length)].value,
      clotheType: newClotheType,
      clotheColor: clotheColors[Math.floor(Math.random() * clotheColors.length)].value,
      graphicType: graphicTypes[Math.floor(Math.random() * graphicTypes.length)].value,
      eyeType: eyeTypes[Math.floor(Math.random() * eyeTypes.length)].value,
      mouthType: mouthTypes[Math.floor(Math.random() * mouthTypes.length)].value,
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)].value
    });
  };

  const getTopIcon = (type) => {
    switch (type) {
      case 'NoHair': return '🦲';
      case 'Eyepatch': return '🏴‍☠️';
      case 'Hat': return '🎩';
      case 'Hijab': return '🧕';
      case 'Turban': return '👳';
      case 'WinterHat1': return '🎿';
      case 'WinterHat2': return '❄️';
      case 'WinterHat3': return '🧢';
      case 'WinterHat4': return '👒';
      case 'LongHairBigHair': return '👩‍🦱';
      case 'LongHairBob': return '💇‍♀️';
      case 'LongHairBun': return '👰';
      case 'LongHairCurly': return '👩‍🦱';
      case 'LongHairCurvy': return '🧝‍♀️';
      case 'LongHairDreads': return '🧑‍🎤';
      case 'LongHairFrida': return '👸';
      case 'LongHairFro': return '✊';
      case 'LongHairFroBand': return '🎵';
      case 'LongHairNotTooLong': return '👩';
      case 'LongHairShavedSides': return '🤘';
      case 'LongHairMiaWallace': return '🖤';
      case 'LongHairStraight': return '👱‍♀️';
      case 'LongHairStraight2': return '👩‍🦳';
      case 'LongHairStraightStrand': return '💁‍♀️';
      case 'ShortHairDreads01': return '🎸';
      case 'ShortHairDreads02': return '🎤';
      case 'ShortHairFrizzle': return '⚡';
      case 'ShortHairShaggyMullet': return '🤟';
      case 'ShortHairShortCurly': return '👨‍🦱';
      case 'ShortHairShortFlat': return '👨‍💼';
      case 'ShortHairShortRound': return '👶';
      case 'ShortHairShortWaved': return '🧑‍💻';
      case 'ShortHairSides': return '👨‍🚀';
      case 'ShortHairTheCaesar': return '🏛️';
      case 'ShortHairTheCaesarSidePart': return '👑';
      default: return '💇';
    }
  };

  const getClotheIcon = (type) => {
    switch (type) {
      case 'BlazerShirt': return '🤵';
      case 'BlazerSweater': return '👔';
      case 'CollarSweater': return '🧥';
      case 'GraphicShirt': return '👕';
      case 'Hoodie': return '👘';
      case 'Overall': return '🦺';
      case 'ShirtCrewNeck': return '👚';
      case 'ShirtScoopNeck': return '👗';
      case 'ShirtVNeck': return '🎽';
      default: return '👕';
    }
  };

  const getGraphicIcon = (type) => {
    switch (type) {
      case 'Bat': return '🦇';
      case 'Cumbia': return '🎵';
      case 'Deer': return '🦌';
      case 'Diamond': return '💎';
      case 'Hola': return '👋';
      case 'Pizza': return '🍕';
      case 'Resist': return '✊';
      case 'Selena': return '🌹';
      case 'Bear': return '🐻';
      case 'SkullOutline': return '💀';
      case 'Skull': return '☠️';
      default: return '🎨';
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
      case 'Dizzy': return '😵';
      case 'EyeRoll': return '🙄';
      case 'Side': return '👀';
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

  const isHatType = (topType) => {
    const hatTypes = ['Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4'];
    return hatTypes.includes(topType);
  };

  const isNoColorHairType = (topType) => {
    const noColorTypes = ['NoHair', 'Eyepatch'];
    return noColorTypes.includes(topType);
  };

  const shouldShowHairColors = () => {
    return !isNoColorHairType(config.topType);
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
            {/* Прическа/Шапка */}
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
                      {getTopIcon(type.value)}
                    </button>
                    <span className="control-label">{type.label}</span>
                  </div>
                ))}
              </div>

              {shouldShowHairColors() && (
                <div className="color-section-compact">
                  <h4>{isHatType(config.topType) ? t('avatar.hatColor') : t('avatar.hairColor')}</h4>
                  <div className="color-dots-grid">
                    {hairColors.map(color => (
                      <button
                        key={color.value}
                        className={`color-dot ${
                          (isHatType(config.topType) ? config.hatColor : config.hairColor) === color.value ? 'active' : ''
                        }`}
                        style={{ backgroundColor: color.color }}
                        onClick={() => 
                          isHatType(config.topType) 
                            ? setConfig({ ...config, hatColor: color.value })
                            : setConfig({ ...config, hairColor: color.value })
                        }
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Дрехи */}
            <div className="control-section">
              <h3>👕 {t('avatar.clothes.title')}</h3>
              <div className="control-grid-with-labels">
                {clotheTypes.map(type => (
                  <div key={type.value} className="control-item">
                    <button
                      className={`control-btn-icon ${config.clotheType === type.value ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, clotheType: type.value })}
                      aria-label={type.label}
                    >
                      {getClotheIcon(type.value)}
                    </button>
                    <span className="control-label">{type.label}</span>
                  </div>
                ))}
              </div>

              {/* Графики за GraphicShirt */}
              {config.clotheType === 'GraphicShirt' && (
                <div className="color-section-compact">
                  <h4>{t('avatar.graphics.title')}</h4>
                  <div className="control-grid-with-labels">
                    {graphicTypes.map(type => (
                      <div key={type.value} className="control-item">
                        <button
                          className={`control-btn-icon ${config.graphicType === type.value ? 'active' : ''}`}
                          onClick={() => setConfig({ ...config, graphicType: type.value })}
                          aria-label={type.label}
                        >
                          {getGraphicIcon(type.value)}
                        </button>
                        <span className="control-label">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="color-section-compact">
                <h4>{t('avatar.clotheColor')}</h4>
                <div className="color-dots-grid">
                  {clotheColors.map(color => (
                    <button
                      key={color.value}
                      className={`color-dot ${config.clotheColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.color }}
                      onClick={() => setConfig({ ...config, clotheColor: color.value })}
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

              {/* Цветове за брадата */}
              {config.facialHairType !== 'Blank' && (
                <div className="color-section-compact">
                  <h4>{t('avatar.beardColor')}</h4>
                  <div className="color-dots-grid">
                    {hairColors.map(color => (
                      <button
                        key={color.value}
                        className={`color-dot ${config.facialHairColor === color.value ? 'active' : ''}`}
                        style={{ backgroundColor: color.color }}
                        onClick={() => setConfig({ ...config, facialHairColor: color.value })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              )}
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