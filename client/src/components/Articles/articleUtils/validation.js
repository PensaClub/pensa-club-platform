import { isEditorEmpty } from "./article-utils";

/**
 * Валидира отделно поле на статия
 * @param {string} name - Име на полето
 * @param {any} value - Стойност на полето
 * @param {Function} t - Функция за превод
 * @returns {string} - Текст на грешката или празен стринг, ако няма грешка
 */
export const validateArticleField = (name, value, t) => {
  let error = "";

  switch (name) {
    case "title":
      error = !value.trim() ? t("articles.validation.title_required") :
              value.length < 4 ? t("articles.validation.title_too_short") :
              value.length > 100 ? t("articles.validation.title_too_long") : "";
      break;
    case "slug":
      error = !value.trim() ? t("articles.validation.slug_required") :
              !/^[a-z0-9-]+$/.test(value) ? t("articles.validation.slug_invalid_format") : "";
      break;
    case "author":
      error = !value.trim() ? t("articles.validation.author_required") : "";
      break;
    case "summary":
      error = isEditorEmpty(value) ? t("articles.validation.summary_required") : "";  // ПРОМЕНЕНО
      break;
    case "mainImage.alt":
      error = isEditorEmpty(value) ? t("articles.validation.image_alt_required") : "";  // ПРОМЕНЕНО
      break;
    default:
      if (name.startsWith("sections")) {
        const field = name.split(".").pop();
        if (field === "title" && !value.trim()) {
          error = t("articles.validation.section_title_required");
        } else if (field === "content" && isEditorEmpty(value)) {  // ПРОМЕНЕНО
          error = t("articles.validation.section_content_required");
        }
      }
      break;
  }

  return error;
};

/**
 * Валидира цялата форма на статия
 * @param {Object} values - Всички стойности на формата
 * @param {Function} t - Функция за превод
 * @returns {Object} - Обект с грешки {fieldName: errorMessage}
 */
export const validateArticleForm = (values, t) => {
  const errors = {};

  // Основни полета
  errors.title = validateArticleField("title", values.title, t);
  errors.slug = validateArticleField("slug", values.slug, t);
  // errors.author = validateArticleField("author", values.author, t);
  // errors.summary = validateArticleField("summary", values.summary, t);

  // Секции
  values.sections.forEach((section, index) => {
    if (!section.title?.trim()) {
      errors[`sections[${index}].title`] = t("articles.validation.section_title_required");
    }

    if (isEditorEmpty(section.content)) {  // ПРОМЕНЕНО
      errors[`sections[${index}].content`] = t("articles.validation.section_content_required");
    }
  });

  return errors;
};

/**
 * Проверява дали формата е валидна (всички полета са валидни)
 * @param {Object} errors - Обект с грешки
 * @returns {boolean} - true ако всички полета са валидни
 */
export const isFormValid = (errors) => {
  return Object.values(errors).every(error => !error);
};