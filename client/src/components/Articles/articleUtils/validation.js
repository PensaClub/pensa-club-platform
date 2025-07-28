import { isSlateEmpty } from "./htmlToSlate";

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
            error = isSlateEmpty(value) ? t("articles.validation.summary_required") : "";
            break;
        case "mainImage.alt":
            error = isSlateEmpty(value) ? t("articles.validation.image_alt_required") : "";
            break;
        default:
            if (name.startsWith("sections")) {
                const field = name.split(".").pop();
                if (field === "title" && !value.trim()) {
                    error = t("articles.validation.section_title_required");
                } else if (field === "content" && isSlateEmpty(value)) {
                    error = t("articles.validation.section_content_required");
                }
            }
            break;
    }

    return error;
};

export const validateArticleForm = (values, t) => {
    const errors = {};

    errors.title = validateArticleField("title", values.title, t);
    errors.slug = validateArticleField("slug", values.slug, t);
    errors.summary = validateArticleField("summary", values.summary, t);

    values.sections.forEach((section, index) => {
        if (!section.title?.trim()) {
            errors[`sections[${index}].title`] = t("articles.validation.section_title_required");
        }

        if (isSlateEmpty(section.content)) {
            errors[`sections[${index}].content`] = t("articles.validation.section_content_required");
        }
    });

    return errors;
};

export const isFormValid = (errors) => {
    return Object.values(errors).every(error => !error);
};