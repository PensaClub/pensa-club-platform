const showcaseController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { Op } = require('sequelize');
const {
  showcase_slide,
  article, mainImage,
  seminar,
  course,
  initiative, image,
  project,
  publication,
  Club,
} = require('../sequelize/models/index');

const SHOWCASE_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://pensa.club';
const SHOWCASE_DEFAULT_IMAGE = `${SHOWCASE_BASE_URL}/images/homePage/logo-2.png`;
const showcasePickImage = (...candidates) => {
  for (const c of candidates) {
    if (c && String(c).trim()) return String(c).trim();
  }
  return SHOWCASE_DEFAULT_IMAGE;
};

// ===============================
// Auto-generate slides from latest content
// ===============================
const autoGenerateSlides = async () => {
  const slides = [];

  // Latest article
  try {
    const art = await article.findOne({
      order: [['createdAt', 'DESC']],
      include: [{ model: mainImage, as: 'mainImage' }],
    });
    if (art) {
      slides.push({
        id: `auto-article-${art.id}`,
        type: 'article',
        referenceId: art.id,
        title: art.title,
        description: art.shortDescription || '',
        categoryLabel: 'Статия',
        imageUrl: showcasePickImage(
          art.mainImage?.sources?.[0],
          art.mainImage?.thumbnail,
        ),
        linkUrl: `/articles/${art.slug || art.id}`,
        buttonText: 'Прочети повече',
        durationSeconds: 6,
      });
    }
  } catch (e) { console.error('Showcase auto: article error', e.message); }

  // Latest seminar
  try {
    const sem = await seminar.findOne({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
    });
    if (sem) {
      slides.push({
        id: `auto-seminar-${sem.id}`,
        type: 'seminar',
        referenceId: sem.id,
        title: sem.title,
        description: sem.shortDescription || '',
        categoryLabel: 'Семинар',
        imageUrl: showcasePickImage(sem.thumbnailUrl),
        linkUrl: `/academy/seminars/${sem.slug || sem.id}`,
        buttonText: 'Разгледай',
        durationSeconds: 6,
      });
    }
  } catch (e) { console.error('Showcase auto: seminar error', e.message); }

  // Latest course
  try {
    const crs = await course.findOne({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
    });
    if (crs) {
      slides.push({
        id: `auto-course-${crs.id}`,
        type: 'course',
        referenceId: crs.id,
        title: crs.title,
        description: crs.shortDescription || '',
        categoryLabel: 'Курс',
        imageUrl: showcasePickImage(crs.thumbnailUrl),
        linkUrl: `/academy/courses/${crs.slug || crs.id}`,
        buttonText: 'Разгледай',
        durationSeconds: 6,
      });
    }
  } catch (e) { console.error('Showcase auto: course error', e.message); }

  // Latest initiative
  try {
    const init = await initiative.findOne({
      order: [['createdAt', 'DESC']],
      include: [{ model: image, as: 'mainImage', required: false }],
    });
    if (init) {
      slides.push({
        id: `auto-initiative-${init.id}`,
        type: 'initiative',
        referenceId: init.id,
        title: init.title,
        description: init.shortDescription || '',
        categoryLabel: 'Инициатива',
        imageUrl: showcasePickImage(
          init.mainImage?.src,
          init.mainImage?.thumbnailUrl,
        ),
        linkUrl: `/initiatives/${init.slug || init.id}`,
        buttonText: 'Разгледай',
        durationSeconds: 6,
      });
    }
  } catch (e) { console.error('Showcase auto: initiative error', e.message); }

  // Latest project
  try {
    const proj = await project.findOne({
      order: [['createdAt', 'DESC']],
      include: [{ model: image, as: 'mainImage', required: false }],
    });
    if (proj) {
      slides.push({
        id: `auto-project-${proj.id}`,
        type: 'project',
        referenceId: proj.id,
        title: proj.title,
        description: proj.shortDescription || '',
        categoryLabel: 'Проект',
        imageUrl: showcasePickImage(
          proj.mainImage?.src,
          proj.mainImage?.thumbnailUrl,
        ),
        linkUrl: `/projects/${proj.slug || proj.id}`,
        buttonText: 'Разгледай',
        durationSeconds: 6,
      });
    }
  } catch (e) { console.error('Showcase auto: project error', e.message); }

  // Latest publication
  try {
    const pub = await publication.findOne({
      order: [['createdAt', 'DESC']],
      include: [{ model: image, as: 'image', required: false }],
    });
    if (pub) {
      slides.push({
        id: `auto-publication-${pub.id}`,
        type: 'publication',
        referenceId: pub.id,
        title: pub.title,
        description: '',
        categoryLabel: 'Публикация',
        imageUrl: showcasePickImage(
          pub.image?.src,
          pub.image?.thumbnailUrl,
        ),
        linkUrl: `/publications/${pub.slug || pub.id}`,
        buttonText: 'Разгледай',
        durationSeconds: 6,
      });
    }
  } catch (e) { console.error('Showcase auto: publication error', e.message); }

  // Latest club
  try {
    const clb = await Club.findOne({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
    });
    if (clb) {
      slides.push({
        id: `auto-club-${clb.id}`,
        type: 'club',
        referenceId: clb.id,
        title: clb.name,
        description: '',
        categoryLabel: 'Клуб',
        imageUrl: showcasePickImage(clb.mainImage),
        linkUrl: `/clubs/${clb.slug || clb.id}`,
        buttonText: 'Разгледай',
        durationSeconds: 6,
      });
    }
  } catch (e) { console.error('Showcase auto: club error', e.message); }

  return slides;
};

// ===============================
// GET /showcase/slides (public)
// Returns manual slides if any, otherwise auto-generates
// ===============================
showcaseController.get('/slides', async (req, res, next) => {
  try {
    const manualSlides = await showcase_slide.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']],
    });

    if (manualSlides.length > 0) {
      // Ensure every slide has a usable imageUrl — older rows may have been
      // saved without one, which left a black card on the Home slider.
      const normalized = manualSlides.map((s) => {
        const json = s.toJSON();
        if (!json.imageUrl || !String(json.imageUrl).trim()) {
          json.imageUrl = SHOWCASE_DEFAULT_IMAGE;
        }
        return json;
      });
      return res.status(200).json({ slides: normalized, source: 'manual' });
    }

    const autoSlides = await autoGenerateSlides();
    res.status(200).json({ slides: autoSlides, source: 'auto' });
  } catch (err) {
    next(err);
  }
});

// ===============================
// GET /showcase/admin/slides (admin)
// ===============================
showcaseController.get('/admin/slides', isAuth, rbac.checkPermission('subscription', 'read'), async (req, res, next) => {
  try {
    const slides = await showcase_slide.findAll({
      order: [['sortOrder', 'ASC']],
    });
    const autoSlides = await autoGenerateSlides();
    res.status(200).json({ slides, autoSlides });
  } catch (err) {
    next(err);
  }
});

// ===============================
// POST /showcase/admin/slides (admin)
// ===============================
showcaseController.post('/admin/slides', isAuth, rbac.checkPermission('subscription', 'read'), async (req, res, next) => {
  try {
    const { type, referenceId, title, description, categoryLabel, imageUrl, linkUrl, buttonText, sortOrder, durationSeconds } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'Title and imageUrl are required.' });
    }

    const maxOrder = await showcase_slide.max('sortOrder') || 0;

    const slide = await showcase_slide.create({
      type: type || 'custom',
      referenceId: referenceId || null,
      title,
      description: description || null,
      categoryLabel: categoryLabel || null,
      imageUrl,
      linkUrl: linkUrl || null,
      buttonText: buttonText || 'Разгледай още',
      sortOrder: sortOrder ?? maxOrder + 1,
      durationSeconds: durationSeconds || 6,
      isActive: true,
    });

    res.status(201).json({ slide });
  } catch (err) {
    next(err);
  }
});

// ===============================
// PUT /showcase/admin/slides/:id (admin)
// ===============================
showcaseController.put('/admin/slides/:id', isAuth, rbac.checkPermission('subscription', 'read'), async (req, res, next) => {
  try {
    const slide = await showcase_slide.findByPk(parseInt(req.params.id));
    if (!slide) return res.status(404).json({ message: 'Slide not found.' });

    const allowed = ['title', 'description', 'categoryLabel', 'imageUrl', 'linkUrl', 'buttonText', 'sortOrder', 'isActive', 'durationSeconds', 'type', 'referenceId'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    await slide.update(updates);
    res.status(200).json({ slide });
  } catch (err) {
    next(err);
  }
});

// ===============================
// DELETE /showcase/admin/slides/:id (admin)
// ===============================
showcaseController.delete('/admin/slides/:id', isAuth, rbac.checkPermission('subscription', 'read'), async (req, res, next) => {
  try {
    const slide = await showcase_slide.findByPk(parseInt(req.params.id));
    if (!slide) return res.status(404).json({ message: 'Slide not found.' });

    await slide.destroy();
    res.status(200).json({ message: 'Slide deleted.' });
  } catch (err) {
    next(err);
  }
});

// ===============================
// PUT /showcase/admin/reorder (admin)
// ===============================
showcaseController.put('/admin/reorder', isAuth, rbac.checkPermission('subscription', 'read'), async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'Order must be an array of slide IDs.' });
    }

    await Promise.all(
      order.map((id, idx) => showcase_slide.update({ sortOrder: idx }, { where: { id } }))
    );

    res.status(200).json({ message: 'Reordered.' });
  } catch (err) {
    next(err);
  }
});

module.exports = showcaseController;
