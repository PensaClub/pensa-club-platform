'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // 1. Insert clubs
        await queryInterface.bulkInsert('clubs', [
            {
                slug: 'klub-zlatna-esen-sofia',
                name: "Клуб 'Златна есен' - София",
                short_description: 'Най-активният клуб за пенсионери в кв. Лозенец с богата културна програма, хор, народни танци и компютърни курсове.',
                founded_year: 2012,
                status: 'active',
                logo: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=200&h=200&fit=crop',
                main_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
                category: 'cultural',
                is_verified: true,
                is_public: true,
                is_draft: false,
                rating: 4.70,
                views: 342,
                total_members: 67,
                tags: JSON.stringify(['култура', 'хор', 'танци', 'София']),
                created_at: now,
                updated_at: now,
            },
            {
                slug: 'sportist-60-plus-plovdiv',
                name: 'Спортист 60+ Пловдив',
                short_description: 'Спортен клуб за активни хора над 60 години. Йога, плуване, разходки в природата и спортни състезания.',
                founded_year: 2018,
                status: 'active',
                logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
                main_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
                category: 'sports',
                is_verified: true,
                is_public: true,
                is_draft: false,
                rating: 4.50,
                views: 218,
                total_members: 45,
                tags: JSON.stringify(['спорт', 'йога', 'плуване', 'Пловдив']),
                created_at: now,
                updated_at: now,
            },
            {
                slug: 'digitalni-babi-i-diadovtsi-varna',
                name: 'Дигитални баби и дядовци - Варна',
                short_description: 'Образователен клуб за дигитална грамотност. Научете се да използвате смартфон, интернет и социални мрежи безопасно.',
                founded_year: 2020,
                status: 'active',
                logo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=200&h=200&fit=crop',
                main_image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=400&fit=crop',
                category: 'educational',
                is_verified: true,
                is_public: true,
                is_draft: false,
                rating: 4.80,
                views: 456,
                total_members: 38,
                tags: JSON.stringify(['образование', 'технологии', 'дигитална грамотност', 'Варна']),
                created_at: now,
                updated_at: now,
            },
            {
                slug: 'klub-druzhba-burgas',
                name: "Клуб 'Дружба' - Бургас",
                short_description: 'Социален клуб за общуване, екскурзии и съвместни дейности. Всеки петък — вечер на настолни игри и разговори.',
                founded_year: 2015,
                status: 'active',
                logo: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200&h=200&fit=crop',
                main_image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=400&fit=crop',
                category: 'social',
                is_verified: true,
                is_public: true,
                is_draft: false,
                rating: 4.30,
                views: 189,
                total_members: 52,
                tags: JSON.stringify(['социален', 'екскурзии', 'настолни игри', 'Бургас']),
                created_at: now,
                updated_at: now,
            },
            {
                slug: 'klub-traditsia-veliko-tarnovo',
                name: "Клуб 'Традиция' - Велико Търново",
                short_description: 'Клуб за съхранение на българските традиции — народни песни, готварски ателиета, занаяти и празнична програма.',
                founded_year: 2011,
                status: 'active',
                logo: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=200&h=200&fit=crop',
                main_image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=400&fit=crop',
                category: 'cultural',
                is_verified: true,
                is_public: true,
                is_draft: false,
                rating: 4.60,
                views: 275,
                total_members: 41,
                tags: JSON.stringify(['традиции', 'народни песни', 'занаяти', 'Велико Търново']),
                created_at: now,
                updated_at: now,
            },
        ]);

        // 2. Get inserted club IDs via raw SQL
        const [clubs] = await queryInterface.sequelize.query(
            `SELECT id, slug FROM clubs WHERE slug IN (
                'klub-zlatna-esen-sofia',
                'sportist-60-plus-plovdiv',
                'digitalni-babi-i-diadovtsi-varna',
                'klub-druzhba-burgas',
                'klub-traditsia-veliko-tarnovo'
            ) ORDER BY id ASC`
        );

        if (!clubs || clubs.length === 0) {
            console.log('⚠️  No clubs found after insert — skipping related tables');
            return;
        }

        const clubMap = {};
        clubs.forEach(c => { clubMap[c.slug] = c.id; });

        const id1 = clubMap['klub-zlatna-esen-sofia'];
        const id2 = clubMap['sportist-60-plus-plovdiv'];
        const id3 = clubMap['digitalni-babi-i-diadovtsi-varna'];
        const id4 = clubMap['klub-druzhba-burgas'];
        const id5 = clubMap['klub-traditsia-veliko-tarnovo'];

        // 3. Insert club_details
        await queryInterface.bulkInsert('club_details', [
            {
                club_id: id1,
                full_description: "Клуб 'Златна есен' е основан през 2012 г. и обединява над 60 активни пенсионери от кв. Лозенец. Предлагаме хор, народни танци, компютърни курсове и здравни лекции.",
                gallery: JSON.stringify([]),
                contacts: JSON.stringify({ phone: '02 987 6543', email: 'zlatna.esen@example.com' }),
                template: 'cultural',
                management: JSON.stringify({ board: [{ name: 'Анка Димитрова', role: 'Председател' }] }),
                created_at: now, updated_at: now,
            },
            {
                club_id: id2,
                full_description: 'Спортен клуб за хора над 60 години в Пловдив. Организираме групови тренировки, йога сесии и походи в Родопите.',
                gallery: JSON.stringify([]),
                contacts: JSON.stringify({ phone: '032 654 321', email: 'sportist60@example.com' }),
                template: 'sports',
                management: JSON.stringify({ board: [{ name: 'Георги Стоянов', role: 'Председател' }] }),
                created_at: now, updated_at: now,
            },
            {
                club_id: id3,
                full_description: 'Образователен клуб във Варна за дигитална грамотност на възрастни. Безплатни курсове по смартфони, интернет безопасност и социални мрежи.',
                gallery: JSON.stringify([]),
                contacts: JSON.stringify({ phone: '052 123 456', email: 'digi.varna@example.com' }),
                template: 'general',
                management: JSON.stringify({ board: [{ name: 'Мария Иванова', role: 'Председател' }] }),
                created_at: now, updated_at: now,
            },
            {
                club_id: id4,
                full_description: "Социален клуб 'Дружба' в Бургас. Събираме се за настолни игри, разговори, общи вечери и организираме екскурзии до Черноморието.",
                gallery: JSON.stringify([]),
                contacts: JSON.stringify({ phone: '056 789 012', email: 'druzhba.burgas@example.com' }),
                template: 'social',
                management: JSON.stringify({ board: [{ name: 'Петър Николов', role: 'Председател' }] }),
                created_at: now, updated_at: now,
            },
            {
                club_id: id5,
                full_description: "Клуб 'Традиция' във Велико Търново съхранява българските обичаи чрез народни песни, готварски ателиета и занаяти.",
                gallery: JSON.stringify([]),
                contacts: JSON.stringify({ phone: '062 345 678', email: 'traditsia.vt@example.com' }),
                template: 'cultural',
                management: JSON.stringify({ board: [{ name: 'Елена Георгиева', role: 'Председател' }] }),
                created_at: now, updated_at: now,
            },
        ]);

        // 4. Insert club_locations
        await queryInterface.bulkInsert('club_locations', [
            { club_id: id1, address: 'ул. Витоша 127, ет. 2', city: 'София', municipality: 'Столична', region: 'София-град', postal_code: '1463', coordinates: JSON.stringify({ lat: 42.6777, lng: 23.3219 }), venue: JSON.stringify({ type: 'municipal', capacity: 80, accessibility: true }), created_at: now, updated_at: now },
            { club_id: id2, address: 'бул. Марица 52', city: 'Пловдив', municipality: 'Пловдив', region: 'Пловдив', postal_code: '4000', coordinates: JSON.stringify({ lat: 42.1354, lng: 24.7453 }), venue: JSON.stringify({ type: 'sports_complex', capacity: 60, accessibility: true }), created_at: now, updated_at: now },
            { club_id: id3, address: 'ул. Сливница 18', city: 'Варна', municipality: 'Варна', region: 'Варна', postal_code: '9000', coordinates: JSON.stringify({ lat: 43.2141, lng: 27.9147 }), venue: JSON.stringify({ type: 'municipal', capacity: 40, accessibility: true }), created_at: now, updated_at: now },
            { club_id: id4, address: 'ул. Александровска 87', city: 'Бургас', municipality: 'Бургас', region: 'Бургас', postal_code: '8000', coordinates: JSON.stringify({ lat: 42.5048, lng: 27.4626 }), venue: JSON.stringify({ type: 'municipal', capacity: 70, accessibility: true }), created_at: now, updated_at: now },
            { club_id: id5, address: 'ул. Независимост 15', city: 'Велико Търново', municipality: 'Велико Търново', region: 'Велико Търново', postal_code: '5000', coordinates: JSON.stringify({ lat: 43.0757, lng: 25.6172 }), venue: JSON.stringify({ type: 'municipal', capacity: 50, accessibility: true }), created_at: now, updated_at: now },
        ]);

        // 5. Insert club_memberships
        await queryInterface.bulkInsert('club_memberships', [
            { club_id: id1, total_members: 67, max_members: 100, minimum_age: 60, age_groups: JSON.stringify({ '60-70': 25, '70-80': 32, '80+': 10 }), membership_fee: JSON.stringify({ monthly: 15, yearly: 150, currency: 'BGN' }), requirements: JSON.stringify(['навършени 60 години']), benefits: JSON.stringify(['всички събития', 'екскурзии']), created_at: now, updated_at: now },
            { club_id: id2, total_members: 45, max_members: 80, minimum_age: 60, age_groups: JSON.stringify({ '60-70': 30, '70-80': 12, '80+': 3 }), membership_fee: JSON.stringify({ monthly: 20, yearly: 200, currency: 'BGN' }), requirements: JSON.stringify(['навършени 60 години']), benefits: JSON.stringify(['фитнес зала', 'тренировки']), created_at: now, updated_at: now },
            { club_id: id3, total_members: 38, max_members: 60, minimum_age: 55, age_groups: JSON.stringify({ '55-65': 15, '65-75': 18, '75+': 5 }), membership_fee: JSON.stringify({ monthly: 0, yearly: 0, currency: 'BGN' }), requirements: JSON.stringify(['желание за учене']), benefits: JSON.stringify(['безплатни курсове', 'ментор']), created_at: now, updated_at: now },
            { club_id: id4, total_members: 52, max_members: 80, minimum_age: 60, age_groups: JSON.stringify({ '60-70': 20, '70-80': 25, '80+': 7 }), membership_fee: JSON.stringify({ monthly: 10, yearly: 100, currency: 'BGN' }), requirements: JSON.stringify(['навършени 60 години']), benefits: JSON.stringify(['социални събития', 'екскурзии']), created_at: now, updated_at: now },
            { club_id: id5, total_members: 41, max_members: 70, minimum_age: 60, age_groups: JSON.stringify({ '60-70': 15, '70-80': 20, '80+': 6 }), membership_fee: JSON.stringify({ monthly: 10, yearly: 100, currency: 'BGN' }), requirements: JSON.stringify(['интерес към традиции']), benefits: JSON.stringify(['готварски ателиета', 'хор']), created_at: now, updated_at: now },
        ]);

        // 6. Insert club_activities (featured)
        await queryInterface.bulkInsert('club_activities', [
            { club_id: id1, type: 'regular', name: 'Хор', title: 'Хор "Златни гласове"', description: 'Репетиции всяка сряда от 15:00.', schedule: JSON.stringify({ day: 'сряда', time: '15:00' }), is_active: true, featured: true, created_at: now, updated_at: now },
            { club_id: id2, type: 'regular', name: 'Йога', title: 'Сутрешна йога', description: 'Лека йога за начинаещи.', schedule: JSON.stringify({ day: 'понеделник', time: '09:00' }), is_active: true, featured: true, created_at: now, updated_at: now },
            { club_id: id3, type: 'regular', name: 'Компютърен курс', title: 'Основи на смартфона', description: 'Android/iPhone — от обаждания до приложения.', schedule: JSON.stringify({ day: 'вторник', time: '10:00' }), is_active: true, featured: true, created_at: now, updated_at: now },
            { club_id: id4, type: 'regular', name: 'Вечер на игрите', title: 'Настолни игри', description: 'Шах, табла, карти всеки петък.', schedule: JSON.stringify({ day: 'петък', time: '17:00' }), is_active: true, featured: true, created_at: now, updated_at: now },
            { club_id: id5, type: 'regular', name: 'Народни песни', title: 'Фолклорна група', description: 'Български народни песни.', schedule: JSON.stringify({ day: 'четвъртък', time: '14:00' }), is_active: true, featured: true, created_at: now, updated_at: now },
        ]);

        console.log('✅ Demo clubs seeded successfully — 5 clubs with details, locations, memberships, activities');
    },

    async down(queryInterface, Sequelize) {
        const slugs = [
            'klub-zlatna-esen-sofia',
            'sportist-60-plus-plovdiv',
            'digitalni-babi-i-diadovtsi-varna',
            'klub-druzhba-burgas',
            'klub-traditsia-veliko-tarnovo',
        ];

        const [clubs] = await queryInterface.sequelize.query(
            `SELECT id FROM clubs WHERE slug IN (${slugs.map(s => `'${s}'`).join(',')})`
        );
        const ids = clubs.map(c => c.id);

        if (ids.length > 0) {
            await queryInterface.bulkDelete('club_activities', { club_id: ids }, {});
            await queryInterface.bulkDelete('club_memberships', { club_id: ids }, {});
            await queryInterface.bulkDelete('club_locations', { club_id: ids }, {});
            await queryInterface.bulkDelete('club_details', { club_id: ids }, {});
            await queryInterface.bulkDelete('clubs', { id: ids }, {});
        }
    },
};
