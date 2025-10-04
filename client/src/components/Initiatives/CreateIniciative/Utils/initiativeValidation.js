import { isSlateEmpty } from "./initiativeEditorUtils.jsx";
import { getSlateTextLength } from "./slateUtils.js";

const isHtmlString = (value) => {
    return typeof value === 'string' && (value.includes('<') || value.includes('&'));
};

export const validateInitiativeForm = (values, t) => {
    const newErrors = {};

    // ✅ ЗАДЪЛЖИТЕЛНИ ПОЛЕТА - САМО 2!

    // Title
    if (!values.title?.trim()) {
        newErrors.title = t('validation.title-required');
    } else if (values.title.trim().length < 3) {
        newErrors.title = t('validation.title-min-length');
    }

    // Slug
    if (!values.slug?.trim()) {
        newErrors.slug = t('validation.slug-required');
    } else {
        const slug = values.slug.trim();

        if (slug.length < 3) {
            newErrors.slug = t('validation.slug-min-length');
        } else if (slug.length > 100) {
            newErrors.slug = t('validation.slug-max-length');
        } else if (!/^[a-z0-9-]+$/.test(slug)) {
            newErrors.slug = t('validation.slug-format');
        } else if (slug.startsWith('-') || slug.endsWith('-')) {
            newErrors.slug = 'URL адресът не може да започва или завършва с тире';
        } else if (slug.includes('--')) {
            newErrors.slug = 'URL адресът не може да съдържа два тирета подред';
        }
    }

    // 📝 ОПЦИОНАЛНИ ПОЛЕТА - валидация само ако са попълнени

    // Short Description - минимум само ако е попълнено
    if (values.shortDescription?.trim() && values.shortDescription.trim().length < 10) {
        newErrors.shortDescription = t('validation.description-min-length');
    }

    // Sections - валидация само ако са добавени
    if (values.sections?.length > 0) {
        values.sections.forEach((section, index) => {
            if (section.title?.trim() && section.title.trim().length < 3) {
                newErrors[`sections[${index}].title`] = 'Заглавието на секцията трябва да е поне 3 символа';
            }

            // Проверка само ако има съдържание
            if (section.content) {
                if (isHtmlString(section.content)) {
                    const div = document.createElement('div');
                    div.innerHTML = section.content;
                    const textContent = div.textContent || div.innerText || '';

                    if (textContent.trim().length > 0 && textContent.trim().length < 10) {
                        newErrors[`sections[${index}].content`] = 'Съдържанието трябва да е поне 10 символа';
                    }
                } else if (Array.isArray(section.content)) {
                    const textContent = section.content
                        .map(node => {
                            if (node.children) {
                                return node.children.map(child => child.text || '').join(' ');
                            }
                            return node.text || '';
                        })
                        .join(' ')
                        .trim();

                    if (textContent.length > 0 && textContent.length < 10) {
                        newErrors[`sections[${index}].content`] = 'Съдържанието трябва да е поне 10 символа';
                    }
                }
            }
        });
    }

    // Timeline - само ако е попълнено
    if (values.startDate && values.endDate) {
        if (new Date(values.startDate) >= new Date(values.endDate)) {
            newErrors.endDate = t('validation.end-date-after-start');
        }
    }

    // Milestones - само ако са добавени
    if (values.milestones?.length > 0) {
        values.milestones.forEach((milestone, index) => {
            if (milestone.date && values.startDate && new Date(milestone.date) < new Date(values.startDate)) {
                newErrors[`milestones[${index}].date`] = t('validation.milestone-before-start');
            }

            if (milestone.date && values.endDate && new Date(milestone.date) > new Date(values.endDate)) {
                newErrors[`milestones[${index}].date`] = t('validation.milestone-after-end');
            }

            if (milestone.description?.trim() && milestone.description.trim().length < 5) {
                newErrors[`milestones[${index}].description`] = 'Описанието трябва да е поне 5 символа';
            }
        });
    }

    // Budget - само валиден формат ако е попълнен
    if (values.expectedBudget?.toString().trim()) {
        const budget = Number(values.expectedBudget);
        if (isNaN(budget) || budget <= 0) {
            newErrors.expectedBudget = t('validation.invalid-budget');
        } else if (budget > 999999999) {
            newErrors.expectedBudget = t('validation.budget-too-large');
        }
    }

    // Emails - само формат
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (values.responsible?.email?.trim() && !emailRegex.test(values.responsible.email)) {
        newErrors['responsible.email'] = t('validation.invalid-email');
    }

    if (values.contact?.email?.trim() && !emailRegex.test(values.contact.email)) {
        newErrors['contact.email'] = t('validation.invalid-email');
    }

    if (values.additionalContacts?.length > 0) {
        values.additionalContacts.forEach((contact, index) => {
            if (contact.email?.trim() && !emailRegex.test(contact.email)) {
                newErrors[`additionalContacts[${index}].email`] = t('validation.invalid-email');
            }
        });
    }

    // URLs - само формат
    const urlRegex = /^https?:\/\/.+\..+/;

    if (values.organization?.website?.trim() && !urlRegex.test(values.organization.website)) {
        newErrors['organization.website'] = t('validation.invalid-url');
    }

    ['facebook', 'instagram', 'linkedin', 'twitter'].forEach(platform => {
        if (values.socialMedia?.[platform]?.trim() && !urlRegex.test(values.socialMedia[platform])) {
            newErrors[`socialMedia.${platform}`] = t('validation.invalid-url');
        }
    });

    // Phones - само формат
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;

    if (values.responsible?.phone?.trim() && !phoneRegex.test(values.responsible.phone)) {
        newErrors['responsible.phone'] = t('validation.invalid-phone');
    }

    if (values.contact?.phone?.trim() && !phoneRegex.test(values.contact.phone)) {
        newErrors['contact.phone'] = t('validation.invalid-phone');
    }

    if (values.additionalContacts?.length > 0) {
        values.additionalContacts.forEach((contact, index) => {
            if (contact.phone?.trim() && !phoneRegex.test(contact.phone)) {
                newErrors[`additionalContacts[${index}].phone`] = t('validation.invalid-phone');
            }
        });
    }

    // Partners - само ако са добавени
    if (values.partners?.length > 0) {
        values.partners.forEach((partner, index) => {
            if (partner.website?.trim() && !urlRegex.test(partner.website)) {
                newErrors[`partners[${index}].website`] = t('validation.invalid-url');
            }

            if (partner.description?.trim() && partner.description.trim().length > 10000) {
                newErrors[`partners[${index}].description`] = 'Описанието е твърде дълго (макс. 10000 символа)';
            }
        });
    }

    // Sponsors - само ако са добавени
    if (values.sponsors?.length > 0) {
        values.sponsors.forEach((sponsor, index) => {
            if (sponsor.amount?.toString().trim()) {
                const amount = Number(sponsor.amount);
                if (isNaN(amount) || amount <= 0) {
                    newErrors[`sponsors[${index}].amount`] = t('validation.invalid-amount');
                } else if (amount > 999999999) {
                    newErrors[`sponsors[${index}].amount`] = t('validation.amount-too-large');
                }
            }

            if (sponsor.website?.trim() && !urlRegex.test(sponsor.website)) {
                newErrors[`sponsors[${index}].website`] = t('validation.invalid-url');
            }
        });
    }

    // FAQ - само ако е добавено
    if (values.faq?.length > 0) {
        values.faq.forEach((faqItem, index) => {
            if (faqItem.question?.trim() && faqItem.question.trim().length < 5) {
                newErrors[`faq[${index}].question`] = 'Въпросът трябва да е поне 5 символа';
            } else if (faqItem.question?.trim() && faqItem.question.trim().length > 200) {
                newErrors[`faq[${index}].question`] = 'Въпросът е твърде дълъг (макс. 200 символа)';
            }

            if (faqItem.answer?.trim() && faqItem.answer.trim().length < 10) {
                newErrors[`faq[${index}].answer`] = 'Отговорът трябва да е поне 10 символа';
            } else if (faqItem.answer?.trim() && faqItem.answer.trim().length > 5000) {
                newErrors[`faq[${index}].answer`] = 'Отговорът е твърде дълъг (макс. 5000 символа)';
            }
        });
    }

    // Slate editors - само максимум дължина
    if (values.detailedDescription && !isSlateEmpty(values.detailedDescription)) {
        const textLength = getSlateTextLength(values.detailedDescription);
        if (textLength > 50000) {
            newErrors.detailedDescription = 'Описанието е твърде дълго (макс. 50000 символа)';
        }
    }

    if (values.expectedResults && !isSlateEmpty(values.expectedResults)) {
        const textLength = getSlateTextLength(values.expectedResults);
        if (textLength > 10000) {
            newErrors.expectedResults = 'Очакваните резултати са твърде дълги (макс. 10000 символа)';
        }
    }

    if (values.progressReport && !isSlateEmpty(values.progressReport)) {
        const textLength = getSlateTextLength(values.progressReport);
        if (textLength > 10000) {
            newErrors.progressReport = 'Отчетът е твърде дълъг (макс. 10000 символа)';
        }
    }

    return newErrors;
};