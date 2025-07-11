// components/Projects/CreateProject/utils/validateProjectForm.js

import { getSlateTextLength } from "../../CreateIniciative/Utils/slateUtils.js";

/**
 * Validates project form data
 * @param {Object} values - Form values
 * @param {Function} t - Translation function
 * @returns {Object} - Validation errors object
 */
export const validateProjectForm = (values, t) => {
  const newErrors = {};

  // 🎯 ЗАДЪЛЖИТЕЛНИ ПОЛЕТА - само 4

  // 1. Title - ЗАДЪЛЖИТЕЛНО
  if (!values.title?.trim()) {
    newErrors.title = t('projects.validation.title-required');
  } else if (values.title.trim().length < 3) {
    newErrors.title = t('projects.validation.title-min-length');
  } else if (values.title.trim().length > 200) {
    newErrors.title = t('projects.validation.title-max-length');
  }

  // 2. Slug - ЗАДЪЛЖИТЕЛНО
  if (!values.slug?.trim()) {
    newErrors.slug = t('projects.validation.slug-required');
  } else {
    const slug = values.slug.trim();
    
    if (slug.length < 3) {
      newErrors.slug = t('projects.validation.slug-min-length');
    } else if (slug.length > 100) {
      newErrors.slug = t('projects.validation.slug-max-length');
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = t('projects.validation.slug-format');
    } else if (slug.startsWith('-') || slug.endsWith('-')) {
      newErrors.slug = t('projects.validation.slug-no-dash-ends');
    } else if (slug.includes('--')) {
      newErrors.slug = t('projects.validation.slug-no-double-dash');
    }
  }

  // 3. Short Description - ЗАДЪЛЖИТЕЛНО
  if (!values.shortDescription?.trim()) {
    newErrors.shortDescription = t('projects.validation.short-description-required');
  } else if (values.shortDescription.trim().length < 10) {
    newErrors.shortDescription = t('projects.validation.short-description-min-length');
  } else if (values.shortDescription.trim().length > 500) {
    newErrors.shortDescription = t('projects.validation.short-description-max-length');
  }

  // 4. Main Image - ЗАДЪЛЖИТЕЛНО
  if (!values.mainImage?.src?.trim()) {
    newErrors.mainImage = t('projects.validation.image-required');
  }

  // 🎯 ОПЦИОНАЛНИ ПОЛЕТА - валидация само ако са попълнени

  // Full Description - максимум символи
  if (values.fullDescription && Array.isArray(values.fullDescription)) {
    const textLength = getSlateTextLength(values.fullDescription);
    if (textLength > 50000) {
      newErrors.fullDescription = t('projects.validation.description-max-length');
    }
  }

  // Budget validation
  if (values.budget) {
    if (values.budget.goal && isNaN(Number(values.budget.goal))) {
      newErrors['budget.goal'] = t('projects.validation.invalid-number');
    }
    if (values.budget.total && isNaN(Number(values.budget.total))) {
      newErrors['budget.total'] = t('projects.validation.invalid-number');
    }
    if (values.budget.funded && isNaN(Number(values.budget.funded))) {
      newErrors['budget.funded'] = t('projects.validation.invalid-number');
    }
    
    // Budget amounts should be positive
    if (values.budget.goal && Number(values.budget.goal) < 0) {
      newErrors['budget.goal'] = t('projects.validation.positive-number-required');
    }
    if (values.budget.total && Number(values.budget.total) < 0) {
      newErrors['budget.total'] = t('projects.validation.positive-number-required');
    }
    if (values.budget.funded && Number(values.budget.funded) < 0) {
      newErrors['budget.funded'] = t('projects.validation.positive-number-required');
    }
    
    // Funded shouldn't exceed total
    if (values.budget.total && values.budget.funded && 
        Number(values.budget.funded) > Number(values.budget.total)) {
      newErrors['budget.funded'] = t('projects.validation.funded-exceeds-total');
    }
  }

  // Timeline validation
  if (values.timeline?.startDate && values.timeline?.endDate) {
    const startDate = new Date(values.timeline.startDate);
    const endDate = new Date(values.timeline.endDate);
    
    if (startDate >= endDate) {
      newErrors['timeline.endDate'] = t('projects.validation.end-date-after-start');
    }
    
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    if (startDate < oneYearAgo) {
      newErrors['timeline.startDate'] = t('projects.validation.start-date-not-too-old');
    }
  }

  // Application validation
  if (values.applicationDeadline) {
    const deadline = new Date(values.applicationDeadline);
    const today = new Date();
    
    if (deadline < today) {
      newErrors.applicationDeadline = t('projects.validation.application-deadline-future');
    }
    
    if (values.timeline?.startDate && deadline > new Date(values.timeline.startDate)) {
      newErrors.applicationDeadline = t('projects.validation.deadline-before-start');
    }
  }

  // Max participants validation
  if (values.maxParticipants) {
    const maxParticipants = Number(values.maxParticipants);
    if (isNaN(maxParticipants)) {
      newErrors.maxParticipants = t('projects.validation.invalid-number');
    } else if (maxParticipants < 1) {
      newErrors.maxParticipants = t('projects.validation.max-participants-positive');
    } else if (maxParticipants > 10000) {
      newErrors.maxParticipants = t('projects.validation.max-participants-limit');
    }
  }

  // Current participants validation
  if (values.currentParticipants && values.maxParticipants) {
    const current = Number(values.currentParticipants);
    const max = Number(values.maxParticipants);
    if (current > max) {
      newErrors.currentParticipants = t('projects.validation.current-exceeds-max-participants');
    }
  }

  // Participant requirements validation
  if (values.participantRequirements && values.participantRequirements.length > 0) {
    values.participantRequirements.forEach((requirement, index) => {
      if (!requirement?.trim()) {
        newErrors[`participantRequirements[${index}]`] = t('projects.validation.requirement-empty');
      } else if (requirement.trim().length > 200) {
        newErrors[`participantRequirements[${index}]`] = t('projects.validation.requirement-max-length');
      }
    });
  }

  // Contact validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (values.contact?.email?.trim() && !emailRegex.test(values.contact.email)) {
    newErrors['contact.email'] = t('projects.validation.invalid-email');
  }
  
  if (values.contact?.phone?.trim()) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(values.contact.phone)) {
      newErrors['contact.phone'] = t('projects.validation.invalid-phone');
    }
  }

  // Sections validation - само форматиране, не задължителни
  if (values.sections && values.sections.length > 0) {
    values.sections.forEach((section, index) => {
      // Само ако има title, проверяваме дължината
      if (section.title?.trim() && section.title.trim().length > 200) {
        newErrors[`sections[${index}].title`] = t('projects.validation.section-title-max-length');
      }
      
      // Content validation - само максимална дължина
      if (section.content && Array.isArray(section.content)) {
        const textLength = getSlateTextLength(section.content);
        if (textLength > 10000) {
          newErrors[`sections[${index}].content`] = t('projects.validation.section-content-max-length');
        }
      }
    });
  }

  // Team validation - само форматиране
  if (values.team && values.team.length > 0) {
    values.team.forEach((member, index) => {
      // Само ако има име, проверяваме дължината
      if (member.name?.trim() && member.name.trim().length > 100) {
        newErrors[`team[${index}].name`] = t('projects.validation.team-name-max-length');
      }
      
      // Само ако има роля, проверяваме дължината
      if (member.role?.trim() && member.role.trim().length > 100) {
        newErrors[`team[${index}].role`] = t('projects.validation.team-role-max-length');
      }
      
      if (member.email?.trim() && !emailRegex.test(member.email)) {
        newErrors[`team[${index}].email`] = t('projects.validation.invalid-email');
      }
      
      if (member.phone?.trim()) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
        if (!phoneRegex.test(member.phone)) {
          newErrors[`team[${index}].phone`] = t('projects.validation.invalid-phone');
        }
      }
    });
  }

  // Partners validation - само форматиране
  if (values.partners && values.partners.length > 0) {
    values.partners.forEach((partner, index) => {
      if (partner.website?.trim()) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(partner.website)) {
          newErrors[`partners[${index}].website`] = t('projects.validation.invalid-url');
        }
      }
      
      if (partner.description?.length > 1000) {
        newErrors[`partners[${index}].description`] = t('projects.validation.partner-description-max-length');
      }
    });
  }

  // Sponsors validation - само форматиране
  if (values.sponsors && values.sponsors.length > 0) {
    values.sponsors.forEach((sponsor, index) => {
      if (sponsor.amount && isNaN(Number(sponsor.amount))) {
        newErrors[`sponsors[${index}].amount`] = t('projects.validation.invalid-number');
      } else if (sponsor.amount && Number(sponsor.amount) < 0) {
        newErrors[`sponsors[${index}].amount`] = t('projects.validation.positive-number-required');
      }
      
      if (sponsor.website?.trim()) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(sponsor.website)) {
          newErrors[`sponsors[${index}].website`] = t('projects.validation.invalid-url');
        }
      }
    });
  }

  // Media validation
  if (values.gallery && values.gallery.length > 50) {
    newErrors.gallery = t('projects.validation.max-gallery-images');
  }

  if (values.downloadMaterials && values.downloadMaterials.length > 20) {
    newErrors.downloadMaterials = t('projects.validation.max-documents');
  }

  // File size validation
  if (values.gallery && values.gallery.length > 0) {
    values.gallery.forEach((file, index) => {
      if (file.size && file.size > 10 * 1024 * 1024) { // 10MB
        newErrors[`gallery[${index}]`] = t('projects.validation.file-too-large');
      }
    });
  }

  if (values.downloadMaterials && values.downloadMaterials.length > 0) {
    values.downloadMaterials.forEach((file, index) => {
      if (file.size && file.size > 10 * 1024 * 1024) { // 10MB
        newErrors[`downloadMaterials[${index}]`] = t('projects.validation.file-too-large');
      }
    });
  }

  // Milestones validation - само форматиране
  if (values.milestones && values.milestones.length > 0) {
    values.milestones.forEach((milestone, index) => {
      if (milestone.description && milestone.description.length > 500) {
        newErrors[`milestones[${index}].description`] = t('projects.validation.milestone-description-max-length');
      }
      
      // Check if milestone date is within project timeline
      if (milestone.date && values.timeline?.startDate && values.timeline?.endDate) {
        const milestoneDate = new Date(milestone.date);
        const startDate = new Date(values.timeline.startDate);
        const endDate = new Date(values.timeline.endDate);
        
        if (milestoneDate < startDate || milestoneDate > endDate) {
          newErrors[`milestones[${index}].date`] = t('projects.validation.milestone-date-within-timeline');
        }
      }
    });
  }

  // Tags validation
  if (values.tags && values.tags.length > 20) {
    newErrors.tags = t('projects.validation.tags-max-count');
  }

  return newErrors;
};