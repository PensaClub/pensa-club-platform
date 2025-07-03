import { isSlateEmpty } from "./initiativeEditorUtils.js";
import { getSlateTextLength } from "./slateUtils.js";

/**
 * Validates initiative form data
 * @param {Object} values - Form values
 * @param {Function} t - Translation function
 * @returns {Object} - Validation errors object
 */
const isHtmlString = (value) => {
    return typeof value === 'string' && (value.includes('<') || value.includes('&'));
};

export const validateInitiativeForm = (values, t) => {
    const newErrors = {};

    // 🎯 ЗАДЪЛЖИТЕЛНИ ПОЛЕТА - само 3

    // Title - ЗАДЪЛЖИТЕЛНО
    if (!values.title?.trim()) {
        newErrors.title = t('validation.title-required');
    } else if (values.title.trim().length < 3) {
        newErrors.title = t('validation.title-min-length');
    }

    // Short Description - ЗАДЪЛЖИТЕЛНО
    if (!values.shortDescription?.trim()) {
        newErrors.shortDescription = t('validation.description-required');
    } else if (values.shortDescription.trim().length < 10) {
        newErrors.shortDescription = t('validation.description-min-length');
    }

    // Main Image - ЗАДЪЛЖИТЕЛНО
    if (!values.mainImage?.src?.trim()) {
        newErrors.mainImage = t('validation.image-required');
    }

    // 🎯 ОПЦИОНАЛНИ ПОЛЕТА - валидация само ако са попълнени

    // Slug (URL адрес) - ЗАДЪЛЖИТЕЛНО
    if (!values.slug?.trim()) {
        newErrors.slug = t('validation.slug-required');
    } else {
        const slug = values.slug.trim();

        // Минимална дължина
        if (slug.length < 3) {
            newErrors.slug = t('validation.slug-min-length');
        }
        // Максимална дължина
        else if (slug.length > 100) {
            newErrors.slug = t('validation.slug-max-length');
        }
        // Формат - само малки английски букви, цифри и тирета
        else if (!/^[a-z0-9-]+$/.test(slug)) {
            newErrors.slug = t('validation.slug-format');
        }
        // Не може да започва или завършва с тире
        else if (slug.startsWith('-') || slug.endsWith('-')) {
            newErrors.slug = 'URL адресът не може да започва или завършва с тире';
        }
        // Не може да има два тирета подред
        else if (slug.includes('--')) {
            newErrors.slug = 'URL адресът не може да съдържа два тирета подред';
        }
    }
    // 🎯 SECTIONS валидации - вече не са задължителни
    if (values.sections && values.sections.length > 0) {
        values.sections.forEach((section, index) => {
            if (!section.title?.trim()) {
                newErrors[`sections[${index}].title`] = t('validation.section-title-required');
            }

            // Проверка за HTML или Slate формат
            if (isHtmlString(section.content)) {
                // Ако е HTML стринг
                const div = document.createElement('div');
                div.innerHTML = section.content;
                const textContent = div.textContent || div.innerText || '';

                if (!textContent.trim()) {
                    newErrors[`sections[${index}].content`] = t('validation.section-content-required');
                } else if (textContent.trim().length < 10) {
                    newErrors[`sections[${index}].content`] = t('validation.section-content-min-length');
                }
            } else if (Array.isArray(section.content)) {
                // Ако е Slate формат
                const hasContent = section.content.length > 0 &&
                    section.content.some(node => {
                        if (node.children) {
                            return node.children.some(child => child.text?.trim());
                        }
                        return node.text?.trim();
                    });

                if (!hasContent) {
                    newErrors[`sections[${index}].content`] = t('validation.section-content-required');
                } else {
                    const textContent = section.content
                        .map(node => {
                            if (node.children) {
                                return node.children.map(child => child.text || '').join(' ');
                            }
                            return node.text || '';
                        })
                        .join(' ')
                        .trim();

                    if (textContent.length < 10) {
                        newErrors[`sections[${index}].content`] = t('validation.section-content-min-length');
                    }
                }
            } else if (!section.content) {
                newErrors[`sections[${index}].content`] = t('validation.section-content-required');
            }
        });
    }

    // 🎯 TIMELINE валидации - опционални
    // Timeline validation
    if (values.startDate && values.endDate) {
        if (new Date(values.startDate) >= new Date(values.endDate)) {
            newErrors.endDate = t('validation.end-date-after-start');
        }
    }

    // Milestones
    if (values.milestones && values.milestones.length > 0) {
        values.milestones.forEach((milestone, index) => {
            if (!milestone.date?.trim()) {
                newErrors[`milestones[${index}].date`] = t('validation.milestone-date-required');
            }

            if (!milestone.description?.trim()) {
                newErrors[`milestones[${index}].description`] = t('validation.milestone-description-required');
            } else if (milestone.description.trim().length < 5) {
                newErrors[`milestones[${index}].description`] = t('validation.milestone-description-min-length');
            }

            if (milestone.date && values.startDate) {
                const milestoneDate = new Date(milestone.date);
                const startDate = new Date(values.startDate);

                if (milestoneDate < startDate) {
                    newErrors[`milestones[${index}].date`] = t('validation.milestone-before-start');
                }

                if (values.endDate) {
                    const endDate = new Date(values.endDate);
                    if (milestoneDate > endDate) {
                        newErrors[`milestones[${index}].date`] = t('validation.milestone-after-end');
                    }
                }
            }
        });
    }

    // Custom Audience
    if (values.customAudience?.trim() && values.customAudience.trim().length < 5) {
        newErrors.customAudience = t('validation.custom-audience-min-length');
    }

    // Budget
    if (values.expectedBudget?.toString().trim()) {
        const budget = Number(values.expectedBudget);
        if (isNaN(budget) || budget <= 0) {
            newErrors.expectedBudget = t('validation.invalid-budget');
        } else if (budget > 999999999) {
            newErrors.expectedBudget = t('validation.budget-too-large');
        }
    }

    // Currency
    if (values.expectedBudget?.toString().trim() && !values.currency?.trim()) {
        newErrors.currency = t('validation.currency-required');
    }

    const validCurrencies = ['BGN', 'EUR', 'USD', 'GBP'];
    if (values.currency && !validCurrencies.includes(values.currency)) {
        newErrors.currency = t('validation.invalid-currency');
    }

    // 🎯 CONTACTS валидации (само формати, нищо не е задължително)
    // Emails - само формат валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (values.responsible?.email?.trim() && !emailRegex.test(values.responsible.email)) {
        newErrors['responsible.email'] = t('validation.invalid-email');
    }

    if (values.contact?.email?.trim() && !emailRegex.test(values.contact.email)) {
        newErrors['contact.email'] = t('validation.invalid-email');
    }

    // Additional contacts emails
    if (values.additionalContacts && values.additionalContacts.length > 0) {
        values.additionalContacts.forEach((contact, index) => {
            if (contact.email?.trim() && !emailRegex.test(contact.email)) {
                newErrors[`additionalContacts[${index}].email`] = t('validation.invalid-email');
            }
        });
    }

    // URLs валидация 
    const urlRegex = /^https?:\/\/.+\..+/;

    if (values.organization?.website?.trim() && !urlRegex.test(values.organization.website)) {
        newErrors['organization.website'] = t('validation.invalid-url');
    }

    // Social Media URLs
    if (values.socialMedia?.facebook?.trim() && !urlRegex.test(values.socialMedia.facebook)) {
        newErrors['socialMedia.facebook'] = t('validation.invalid-url');
    }

    if (values.socialMedia?.instagram?.trim() && !urlRegex.test(values.socialMedia.instagram)) {
        newErrors['socialMedia.instagram'] = t('validation.invalid-url');
    }

    if (values.socialMedia?.linkedin?.trim() && !urlRegex.test(values.socialMedia.linkedin)) {
        newErrors['socialMedia.linkedin'] = t('validation.invalid-url');
    }

    if (values.socialMedia?.twitter?.trim() && !urlRegex.test(values.socialMedia.twitter)) {
        newErrors['socialMedia.twitter'] = t('validation.invalid-url');
    }

    // Phone валидация (базова)
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;

    if (values.responsible?.phone?.trim() && !phoneRegex.test(values.responsible.phone)) {
        newErrors['responsible.phone'] = t('validation.invalid-phone');
    }

    if (values.contact?.phone?.trim() && !phoneRegex.test(values.contact.phone)) {
        newErrors['contact.phone'] = t('validation.invalid-phone');
    }

    // Additional contacts phones
    if (values.additionalContacts && values.additionalContacts.length > 0) {
        values.additionalContacts.forEach((contact, index) => {
            if (contact.phone?.trim() && !phoneRegex.test(contact.phone)) {
                newErrors[`additionalContacts[${index}].phone`] = t('validation.invalid-phone');
            }
        });
    }

    // 🎯 RESOURCES валидации
    // Partners - масивът не е задължителен, но ако има partners, name е задължително
    if (values.partners && values.partners.length > 0) {
        values.partners.forEach((partner, index) => {
            // Name е задължително ако е добавен partner
            if (!partner.name?.trim()) {
                newErrors[`partners[${index}].name`] = t('validation.partner-name-required');
            }

            // Website - URL формат ако е попълнен
            if (partner.website?.trim() && !urlRegex.test(partner.website)) {
                newErrors[`partners[${index}].website`] = t('validation.invalid-url');
            }
            // 🆕 Description - максимум 10000 символа
            if (partner.description?.trim() && partner.description.trim().length > 10000) {
                newErrors[`partners[${index}].description`] = t('validation.partner-description-max-length');
            }
        });
    }

    // Sponsors - нищо не е задължително, само формати
    if (values.sponsors && values.sponsors.length > 0) {
        values.sponsors.forEach((sponsor, index) => {
            // Name е задължително ако е добавен sponsor
            if (!sponsor.name?.trim()) {
                newErrors[`sponsors[${index}].name`] = t('validation.sponsor-name-required');
            }

            // Amount - валидно число ако е попълнен
            if (sponsor.amount?.toString().trim()) {
                const amount = Number(sponsor.amount);
                if (isNaN(amount) || amount <= 0) {
                    newErrors[`sponsors[${index}].amount`] = t('validation.invalid-amount');
                } else if (amount > 999999999) {
                    newErrors[`sponsors[${index}].amount`] = t('validation.amount-too-large');
                }
            }

            // Website - URL формат ако е попълнен
            if (sponsor.website?.trim() && !urlRegex.test(sponsor.website)) {
                newErrors[`sponsors[${index}].website`] = t('validation.invalid-url');
            }
            // 🆕 Description - максимум 1000 символа
            if (sponsor.description?.trim() && sponsor.description.trim().length > 10000) {
                newErrors[`sponsor[${index}].description`] = t('validation.sponsor-description-max-length');
            }
        });
    }

    // 🎯 MEDIA валидации
    // Download Materials - title е задължително ако е качен документ
    if (values.downloadMaterials && values.downloadMaterials.length > 0) {
        values.downloadMaterials.forEach((material, index) => {
            if (!material.title?.trim()) {
                newErrors[`downloadMaterials[${index}].title`] = t('validation.document-title-required');
            }
        });
    }

    // Gallery - alt текст е препоръчителен (warning, не error)
    if (values.gallery && values.gallery.length > 0) {
        values.gallery.forEach((image, index) => {
            if (!image.alt?.trim()) {
                newErrors[`gallery[${index}].alt`] = t('validation.gallery-alt-recommended');
            }
        });
    }

    // 🎯 PROGRESS & RESULTS валидации
    // KPIs - name и target са задължителни ако е добавен KPI
    if (values.kpis && values.kpis.length > 0) {
        values.kpis.forEach((kpi, index) => {
            if (!kpi.name?.trim()) {
                newErrors[`kpis[${index}].name`] = t('validation.kpi-name-required');
            }

            if (!kpi.target?.trim()) {
                newErrors[`kpis[${index}].target`] = t('validation.kpi-target-required');
            }
        });
    }

    // Expected Results - опционално, но минимум 10 символа ако е попълнено
    if (values.expectedResults) {
        const hasContent = values.expectedResults.length > 0 &&
            values.expectedResults.some(node => {
                if (node.children) {
                    return node.children.some(child => child.text?.trim());
                }
                return node.text?.trim();
            });

        if (hasContent) {
            const textContent = values.expectedResults
                .map(node => {
                    if (node.children) {
                        return node.children.map(child => child.text || '').join(' ');
                    }
                    return node.text || '';
                })
                .join(' ')
                .trim();

            if (textContent.length < 10) {
                newErrors.expectedResults = t('validation.expected-results-min-length');
            }
        }
    }

    // Progress Report - опционално, но минимум 10 символа ако е попълнено
    if (values.progressReport) {
        const hasContent = values.progressReport.length > 0 &&
            values.progressReport.some(node => {
                if (node.children) {
                    return node.children.some(child => child.text?.trim());
                }
                return node.text?.trim();
            });

        if (hasContent) {
            const textContent = values.progressReport
                .map(node => {
                    if (node.children) {
                        return node.children.map(child => child.text || '').join(' ');
                    }
                    return node.text || '';
                })
                .join(' ')
                .trim();

            if (textContent.length < 10) {
                newErrors.progressReport = t('validation.progress-report-min-length');
            }
        }
    }

    // 🎯 ADDITIONAL валидации
    // Tags - опционални, но с ограничения ако се добавят
    if (values.tags && values.tags.length > 0) {
        // Максимум 20 тага
        if (values.tags.length > 20) {
            newErrors.tags = t('validation.tags-max-count');
        }

        // Валидация на всеки таг
        values.tags.forEach((tag, index) => {
            if (tag.trim().length < 2) {
                newErrors[`tags[${index}]`] = t('validation.tag-min-length');
            }
            if (tag.trim().length > 30) {
                newErrors[`tags[${index}]`] = t('validation.tag-max-length');
            }
        });
    }

    // FAQ - опционално, но ако се добави трябва да е качествено
    if (values.faq && values.faq.length > 0) {
        values.faq.forEach((faqItem, index) => {
            // Question валидация
            if (!faqItem.question?.trim()) {
                newErrors[`faq[${index}].question`] = t('validation.faq-question-required');
            } else if (faqItem.question.trim().length < 5) {
                newErrors[`faq[${index}].question`] = t('validation.faq-question-min-length');
            } else if (faqItem.question.trim().length > 200) {
                newErrors[`faq[${index}].question`] = t('validation.faq-question-max-length');
            }

            // Answer валидация
            if (!faqItem.answer?.trim()) {
                newErrors[`faq[${index}].answer`] = t('validation.faq-answer-required');
            } else if (faqItem.answer.trim().length < 10) {
                newErrors[`faq[${index}].answer`] = t('validation.faq-answer-min-length');
            } else if (faqItem.answer.trim().length > 5000) {
                newErrors[`faq[${index}].answer`] = t('validation.faq-answer-max-length');
            }
        });
    }

    // Detailed Description - максимум символи
    if (values.detailedDescription && !isSlateEmpty(values.detailedDescription)) {
        const textLength = getSlateTextLength(values.detailedDescription);
        if (textLength > 50000) {
            newErrors.detailedDescription = t('initiatives.create.detailed-description-limit');
        }
    }

    // Expected Results - максимум символа  
    if (values.expectedResults && !isSlateEmpty(values.expectedResults)) {
        const textLength = getSlateTextLength(values.expectedResults);
        if (textLength > 10000) {
            newErrors.expectedResults = t('initiatives.create.expected-results-limit');
        }
    }

    // Progress Report - максимум символа 
    if (values.progressReport && !isSlateEmpty(values.progressReport)) {
        const textLength = getSlateTextLength(values.progressReport);
        if (textLength > 10000) {
            newErrors.progressReport = t('initiatives.create.progress-report-limit');
        }
    }

    return newErrors;
};