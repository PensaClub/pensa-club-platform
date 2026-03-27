'use strict';

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\sа-яёіїєґ-]/gi, '').replace(/[\s]+/g, '-').substring(0, 120);

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const ago = (days, hours = 0) => new Date(now.getTime() - (days * 86400000 + hours * 3600000));

    // Get some user IDs
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM user_accounts ORDER BY id ASC LIMIT 15'
    );
    if (users.length < 3) {
      console.log('Not enough users for forum seed — skipping');
      return;
    }
    const uid = (i) => users[Math.min(i, users.length - 1)].id;

    // ============ Forum User Statuses ============
    const statuses = [];
    for (let i = 0; i < Math.min(10, users.length); i++) {
      statuses.push({
        user_id: uid(i),
        role: i < 3 ? 'vip' : 'user',
        is_banned: false,
        warning_count: 0,
        rules_accepted_at: ago(30 - i),
        vip_granted_at: i < 3 ? ago(20) : null,
        vip_granted_by: i < 3 ? 'auto' : null,
        created_at: ago(30 - i),
        updated_at: ago(30 - i),
      });
    }
    await queryInterface.bulkInsert('forum_user_statuses', statuses);

    // ============ Spaces ============
    const spaces = [
      { name: 'Компютърна помощ', slug: 'kompyutarna-pomosht', description: 'Въпроси и съвети за работа с компютър, лаптоп и таблет', icon: '🖥️', color: '#4a90d9', status: 'active', is_default: true, sort_order: 1 },
      { name: 'Здраве и благополучие', slug: 'zdrave-i-blagopoluchie', description: 'Споделяне на опит за здравословен начин на живот', icon: '💊', color: '#4aba7a', status: 'active', is_default: true, sort_order: 2 },
      { name: 'Свободна тема', slug: 'svobodna-tema', description: 'Дискусии на свободна тема — всичко, което ви вълнува', icon: '💬', color: '#8a7fc8', status: 'active', is_default: true, sort_order: 3 },
      { name: 'Градинарство', slug: 'gradinarstvo', description: 'Съвети за отглеждане на цветя, плодове и зеленчуци', icon: '🌿', color: '#5aad5a', status: 'active', is_default: false, sort_order: 4 },
      { name: 'Готварство', slug: 'gotvarstvo', description: 'Любими рецепти и кулинарни трикове', icon: '🍳', color: '#d4854a', status: 'active', is_default: false, sort_order: 5 },
      { name: 'Пътешествия', slug: 'pyteshestviya', description: 'Споделете къде сте пътували и какво ви е впечатлило', icon: '🌍', color: '#4a8ab0', status: 'pending', is_default: false, sort_order: 6 },
    ];

    for (const s of spaces) {
      await queryInterface.bulkInsert('forum_spaces', [{
        ...s,
        created_by: uid(0),
        member_count: 0,
        post_count: 0,
        created_at: ago(25),
        updated_at: ago(25),
      }]);
    }

    // Get space IDs
    const [spaceRows] = await queryInterface.sequelize.query(
      "SELECT id, slug FROM forum_spaces WHERE status = 'active' ORDER BY sort_order"
    );
    const spaceId = (slug) => spaceRows.find(s => s.slug === slug)?.id || null;

    // ============ Space Members ============
    const members = [];
    for (let i = 0; i < Math.min(8, users.length); i++) {
      for (const sp of spaceRows.slice(0, 3)) {
        members.push({ space_id: sp.id, user_id: uid(i), role: i === 0 ? 'moderator' : 'member', joined_at: ago(20 - i) });
      }
    }
    await queryInterface.bulkInsert('forum_space_members', members);

    // Update member counts
    for (const sp of spaceRows) {
      const [[{ count }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM forum_space_members WHERE space_id = ${sp.id}`
      );
      await queryInterface.sequelize.query(
        `UPDATE forum_spaces SET member_count = ${count} WHERE id = ${sp.id}`
      );
    }

    // ============ Tags ============
    const tags = [
      { name: 'помощ', slug: 'pomosht' },
      { name: 'съвет', slug: 'savet' },
      { name: 'въпрос', slug: 'vapros' },
      { name: 'рецепта', slug: 'retsepta' },
      { name: 'здраве', slug: 'zdrave' },
      { name: 'технология', slug: 'tehnologiya' },
      { name: 'градина', slug: 'gradina' },
      { name: 'споделяне', slug: 'spodelyane' },
    ];
    for (const t of tags) {
      await queryInterface.bulkInsert('forum_tags', [{
        name: t.name, slug: t.slug, usage_count: 0, created_at: ago(20),
      }]);
    }
    const [tagRows] = await queryInterface.sequelize.query('SELECT id, slug FROM forum_tags ORDER BY id');
    const tagId = (slug) => tagRows.find(t => t.slug === slug)?.id;

    // ============ Posts ============
    const posts = [
      {
        title: 'Как да почистя компютъра от ненужни програми?',
        content: '<p>Здравейте! Компютърът ми стана много бавен напоследък. Има ли лесен начин да премахна програмите, които не използвам? Чувала съм за CCleaner, но не съм сигурна дали е безопасен.</p><p>Благодаря предварително за помощта!</p>',
        type: 'question', spaceSlug: 'kompyutarna-pomosht', authorIdx: 3, daysAgo: 2, tagSlugs: ['pomosht', 'tehnologiya'],
      },
      {
        title: 'Рецепта за баница с тиква — изпробвана и одобрена!',
        content: '<p>Споделям една рецепта, която правя всяка есен и винаги излиза страхотна:</p><h3>Продукти:</h3><ul><li>500г тиква</li><li>6 кори за баница</li><li>3 яйца</li><li>150г сирене</li><li>100мл олио</li><li>Захар по вкус</li></ul><h3>Приготвяне:</h3><p>Тиквата се настъргва на едро ренде. Разбиват се яйцата, добавя се натрошеното сирене и захарта. Всяка кора се намазва с олио и плънка, навива се на руло и се нарежда в тавата.</p><p>Пече се на 180°C около 40 минути до златисто. Много е вкусна и топла, и студена!</p>',
        type: 'article', spaceSlug: 'gotvarstvo', authorIdx: 5, daysAgo: 3, tagSlugs: ['retsepta', 'spodelyane'],
      },
      {
        title: 'Утринна разходка — колко е полезна наистина?',
        content: '<p>Последните 2 месеца ходя всяка сутрин по 30 минути. Чувствам се много по-добре — спя по-добре, имам повече енергия и настроението ми се подобри.</p><p>Някой друг има ли подобен опит? Споделете!</p>',
        type: 'discussion', spaceSlug: 'zdrave-i-blagopoluchie', authorIdx: 1, daysAgo: 1, tagSlugs: ['zdrave', 'spodelyane'],
      },
      {
        title: 'Проблем с WiFi — постоянно се разкачва',
        content: '<p>Имам рутер от А1 и през последната седмица WiFi се разкачва на всеки 10-15 минути. Рестартирах го няколко пъти, но не помогна.</p><p>Какво друго мога да опитам преди да се обадя на техник?</p>',
        type: 'question', spaceSlug: 'kompyutarna-pomosht', authorIdx: 7, daysAgo: 0, tagSlugs: ['pomosht', 'vapros'],
      },
      {
        title: 'Какво засаждате тази пролет?',
        content: '<p>Наближава сезонът за засаждане и се чудя какво планирате? Аз тази година искам да пробвам с чери домати на балкона.</p><p>Имате ли съвети за начинаещи градинари? 🌱</p>',
        type: 'discussion', spaceSlug: 'gradinarstvo', authorIdx: 2, daysAgo: 4, tagSlugs: ['gradina', 'savet'],
      },
      {
        title: 'Безплатни приложения за видео разговори — кое е най-лесното?',
        content: '<p>Внуците ми са в чужбина и искам да говорим по-често с видео. Кое приложение е най-лесно за използване? Опитах Viber, но картината замръзва. Чувала съм за Zoom и Google Meet.</p>',
        type: 'question', spaceSlug: 'kompyutarna-pomosht', authorIdx: 9, daysAgo: 5, tagSlugs: ['pomosht', 'vapros', 'tehnologiya'],
      },
      {
        title: 'Споделям: 5 навика, които промениха ежедневието ми',
        content: '<p>Искам да споделя 5 прости неща, които ме правят по-щастлив:</p><ol><li><strong>Ставам в 7 сутринта</strong> — дори в почивните дни</li><li><strong>Пия чаша топла вода</strong> — преди кафето</li><li><strong>30 минути разходка</strong> — всеки ден</li><li><strong>Чета 20 минути</strong> — преди сън</li><li><strong>Записвам 3 хубави неща</strong> — случили се днес</li></ol><p>Звучат просто, но наистина работят! Какви са вашите навици?</p>',
        type: 'article', spaceSlug: null, authorIdx: 0, daysAgo: 6, tagSlugs: ['zdrave', 'spodelyane'],
        isPinned: true,
      },
      {
        title: 'Как се прави екранна снимка (screenshot)?',
        content: '<p>Много пъти ми трябва да направя снимка на екрана, но не знам как. Компютърът ми е с Windows. Може ли някой да обясни стъпка по стъпка?</p>',
        type: 'question', spaceSlug: 'kompyutarna-pomosht', authorIdx: 6, daysAgo: 7, tagSlugs: ['pomosht', 'vapros'],
      },
    ];

    for (const p of posts) {
      const excerpt = p.content.replace(/<[^>]+>/g, '').substring(0, 490);
      const pubDate = ago(p.daysAgo);
      await queryInterface.bulkInsert('forum_posts', [{
        title: p.title,
        slug: slugify(p.title) + '-' + Math.floor(Math.random() * 1000),
        content: p.content,
        excerpt,
        author_id: uid(p.authorIdx),
        space_id: p.spaceSlug ? spaceId(p.spaceSlug) : null,
        type: p.type,
        status: 'published',
        is_pinned: p.isPinned || false,
        is_locked: false,
        view_count: Math.floor(Math.random() * 80) + 5,
        comment_count: 0,
        reaction_count: 0,
        share_count: Math.floor(Math.random() * 5),
        bookmark_count: Math.floor(Math.random() * 4),
        images: '{}',
        last_activity_at: pubDate,
        published_at: pubDate,
        created_at: pubDate,
        updated_at: pubDate,
      }]);
    }

    // Get post IDs
    const [postRows] = await queryInterface.sequelize.query(
      "SELECT id, author_id, space_id FROM forum_posts WHERE status = 'published' ORDER BY id"
    );

    // ============ Post-Tag links ============
    for (let pi = 0; pi < posts.length && pi < postRows.length; pi++) {
      for (const ts of (posts[pi].tagSlugs || [])) {
        const tid = tagId(ts);
        if (tid) {
          await queryInterface.bulkInsert('forum_post_tags', [{ post_id: postRows[pi].id, tag_id: tid }]);
          await queryInterface.sequelize.query(`UPDATE forum_tags SET usage_count = usage_count + 1 WHERE id = ${tid}`);
        }
      }
    }

    // ============ Comments ============
    const comments = [
      { postIdx: 0, authorIdx: 1, content: 'CCleaner е безопасен, но използвай само безплатната версия. Можеш да ползваш и вградения в Windows — "Добави или премахни програми" от Settings.' },
      { postIdx: 0, authorIdx: 4, content: 'Аз ползвам Revo Uninstaller — много добре изчиства всичко след деинсталация. Има безплатна версия.' },
      { postIdx: 0, authorIdx: 0, content: 'Добър съвет за Revo! Аз бих добавил — винаги рестартирайте компютъра след като премахнете програми. Помага.' },
      { postIdx: 1, authorIdx: 2, content: 'Мммм, вече ми се яде баница! 😋 Ще я пробвам тази неделя.' },
      { postIdx: 1, authorIdx: 8, content: 'Аз слагам и малко канела — дава невероятен аромат!' },
      { postIdx: 2, authorIdx: 4, content: 'Абсолютно вярно! Аз ходя по 45 минути и кръвното ми се нормализира без лекарства.' },
      { postIdx: 2, authorIdx: 6, content: 'Искам да започна, но ми е трудно сутрин. Може ли да е следобедна разходка?' },
      { postIdx: 2, authorIdx: 1, content: 'Разбира се! Важното е да ходиш редовно, не кога точно.' },
      { postIdx: 3, authorIdx: 0, content: 'Пробвай да смениш WiFi канала на рутера — влез в 192.168.1.1 и намери настройките за Wireless. Канал 1, 6 или 11 обикновено работят най-добре.' },
      { postIdx: 3, authorIdx: 2, content: 'При мен същият проблем се оказа, че е от микровълновата — когато е включена, WiFi се разкачва 😅' },
      { postIdx: 4, authorIdx: 5, content: 'Чери доматите на балкона са супер идея! Вземи сорт "Балконско чудо" — специално за саксии е.' },
      { postIdx: 4, authorIdx: 8, content: 'Аз тази година ще садя босилек и магданоз — лесни за поддържане и винаги ми трябват в кухнята.' },
      { postIdx: 5, authorIdx: 3, content: 'Google Meet е много лесен — само влизаш в браузъра, без да инсталираш нищо. Изпращаш линк на внуците и готово!' },
      { postIdx: 5, authorIdx: 0, content: 'За по-стабилна картина пробвай да се свържеш с кабел към рутера вместо WiFi, когато говориш по видео.' },
      { postIdx: 6, authorIdx: 3, content: 'Благодаря за споделянето! Започнах да записвам 3 хубави неща всяка вечер — наистина променя перспективата.' },
      { postIdx: 6, authorIdx: 7, content: 'Чашата топла вода сутрин е страхотен навик! Аз добавям и лимон.' },
      { postIdx: 7, authorIdx: 1, content: 'Натисни бутона Print Screen (PrtSc) на клавиатурата, после отвори Paint и натисни Ctrl+V. Запази файла и готово!' },
      { postIdx: 7, authorIdx: 4, content: 'Или по-лесно — натисни Windows + Shift + S. Появява се инструмент за маркиране на част от екрана.' },
    ];

    for (const c of comments) {
      if (!postRows[c.postIdx]) continue;
      const commentDate = ago(posts[c.postIdx].daysAgo, Math.floor(Math.random() * 20));
      await queryInterface.bulkInsert('forum_comments', [{
        post_id: postRows[c.postIdx].id,
        author_id: uid(c.authorIdx),
        parent_id: null,
        content: c.content,
        images: '{}',
        status: 'visible',
        reaction_count: 0,
        is_edited: false,
        mentioned_users: '{}',
        quoted_comment_id: null,
        created_at: commentDate,
        updated_at: commentDate,
      }]);
    }

    // Add some nested replies
    const [commentRows] = await queryInterface.sequelize.query(
      'SELECT id, post_id FROM forum_comments ORDER BY id LIMIT 18'
    );

    const replies = [
      { parentIdx: 1, authorIdx: 3, content: 'Благодаря! Ще пробвам Revo днес.' },
      { parentIdx: 6, authorIdx: 1, content: 'Да, следобедната разходка е също толкова полезна. Важното е да е всеки ден.' },
      { parentIdx: 9, authorIdx: 7, content: 'Сериозно ли? 😂 Няма да повярвам, но ще изключа микровълновата и ще пробвам!' },
      { parentIdx: 17, authorIdx: 6, content: 'О, не знаех за Windows + Shift + S! Много по-удобно е. Благодаря!' },
    ];

    for (const r of replies) {
      if (!commentRows[r.parentIdx]) continue;
      const parent = commentRows[r.parentIdx];
      await queryInterface.bulkInsert('forum_comments', [{
        post_id: parent.post_id,
        author_id: uid(r.authorIdx),
        parent_id: parent.id,
        content: r.content,
        images: '{}',
        status: 'visible',
        reaction_count: 0,
        is_edited: false,
        mentioned_users: '{}',
        quoted_comment_id: null,
        created_at: ago(0, Math.floor(Math.random() * 10)),
        updated_at: ago(0, Math.floor(Math.random() * 10)),
      }]);
    }

    // ============ Reactions ============
    const emojis = ['👍', '❤️', '😂', '🤔', '👏', '💡'];
    const reactions = [];
    for (const post of postRows) {
      const numReactions = Math.floor(Math.random() * 6) + 1;
      const usedUsers = new Set();
      for (let r = 0; r < numReactions; r++) {
        const userId = uid(Math.floor(Math.random() * Math.min(10, users.length)));
        if (usedUsers.has(userId)) continue;
        usedUsers.add(userId);
        reactions.push({
          user_id: userId,
          target_type: 'post',
          target_id: post.id,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          created_at: ago(Math.floor(Math.random() * 5)),
        });
      }
    }
    if (reactions.length > 0) {
      await queryInterface.bulkInsert('forum_reactions', reactions);
    }

    // ============ Bookmarks ============
    const bookmarks = [];
    for (let i = 0; i < 3; i++) {
      if (postRows[i]) {
        bookmarks.push({
          user_id: uid(0),
          post_id: postRows[i].id,
          created_at: ago(1),
        });
      }
    }
    if (bookmarks.length > 0) {
      await queryInterface.bulkInsert('forum_bookmarks', bookmarks);
    }

    // ============ Update cached counts ============
    for (const post of postRows) {
      const [[{ cc }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as cc FROM forum_comments WHERE post_id = ${post.id} AND status = 'visible'`
      );
      const [[{ rc }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as rc FROM forum_reactions WHERE target_type = 'post' AND target_id = ${post.id}`
      );
      await queryInterface.sequelize.query(
        `UPDATE forum_posts SET comment_count = ${cc}, reaction_count = ${rc}, last_activity_at = NOW() WHERE id = ${post.id}`
      );
    }

    // Update space post counts
    for (const sp of spaceRows) {
      const [[{ pc }]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as pc FROM forum_posts WHERE space_id = ${sp.id} AND status = 'published'`
      );
      await queryInterface.sequelize.query(
        `UPDATE forum_spaces SET post_count = ${pc} WHERE id = ${sp.id}`
      );
    }

    // ============ Badges ============
    await queryInterface.bulkInsert('forum_user_badges', [
      { user_id: uid(0), badge: 'vip_member', awarded_at: ago(15) },
      { user_id: uid(0), badge: 'first_post', awarded_at: ago(25) },
      { user_id: uid(1), badge: 'first_post', awarded_at: ago(22) },
      { user_id: uid(1), badge: 'first_comment', awarded_at: ago(21) },
      { user_id: uid(2), badge: 'first_post', awarded_at: ago(20) },
      { user_id: uid(3), badge: 'first_post', awarded_at: ago(18) },
      { user_id: uid(5), badge: 'first_post', awarded_at: ago(16) },
    ]);

    console.log('✅ Forum seed completed: 5 spaces, 8 posts, 22 comments, reactions, tags, badges');
  },

  async down(queryInterface) {
    // Delete in reverse dependency order
    await queryInterface.bulkDelete('forum_user_badges', null, {});
    await queryInterface.bulkDelete('forum_bookmarks', null, {});
    await queryInterface.bulkDelete('forum_reactions', null, {});
    await queryInterface.bulkDelete('forum_post_tags', null, {});
    await queryInterface.bulkDelete('forum_comments', null, {});
    await queryInterface.bulkDelete('forum_posts', null, {});
    await queryInterface.bulkDelete('forum_tags', null, {});
    await queryInterface.bulkDelete('forum_space_members', null, {});
    await queryInterface.bulkDelete('forum_spaces', null, {});
    await queryInterface.bulkDelete('forum_user_statuses', null, {});
  },
};
