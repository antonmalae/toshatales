import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@toshales.com' },
    update: {},
    create: {
      email: 'admin@toshales.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Дружба' },
      update: {},
      create: {
        name: 'Дружба',
        description: 'Сказки о дружбе и взаимопомощи',
        color: '#4F46E5',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Приключения' },
      update: {},
      create: {
        name: 'Приключения',
        description: 'Захватывающие истории о путешествиях',
        color: '#059669',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Волшебство' },
      update: {},
      create: {
        name: 'Волшебство',
        description: 'Сказки с магией и чудесами',
        color: '#DC2626',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Принятие' },
      update: {},
      create: {
        name: 'Принятие',
        description: 'Истории о принятии различий',
        color: '#7C3AED',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Экология' },
      update: {},
      create: {
        name: 'Экология',
        description: 'Сказки о заботе о природе',
        color: '#059669',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Преодоление страхов' },
      update: {},
      create: {
        name: 'Преодоление страхов',
        description: 'Истории о смелости и преодолении',
        color: '#D97706',
      },
    }),
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'Главный герой' },
      update: {},
      create: {
        name: 'Главный герой',
        description: 'Основной персонаж истории',
      },
    }),
    prisma.role.upsert({
      where: { name: 'Лучший друг' },
      update: {},
      create: {
        name: 'Лучший друг',
        description: 'Верный спутник главного героя',
      },
    }),
    prisma.role.upsert({
      where: { name: 'Мудрый наставник' },
      update: {},
      create: {
        name: 'Мудрый наставник',
        description: 'Опытный персонаж, дающий советы',
      },
    }),
    prisma.role.upsert({
      where: { name: 'Весёлый спутник' },
      update: {},
      create: {
        name: 'Весёлый спутник',
        description: 'Забавный персонаж для развлечения',
      },
    }),
    prisma.role.upsert({
      where: { name: 'Мудрый старец' },
      update: {},
      create: {
        name: 'Мудрый старец',
        description: 'Пожилой персонаж с жизненным опытом',
      },
    }),
    prisma.role.upsert({
      where: { name: 'Особенный друг' },
      update: {},
      create: {
        name: 'Особенный друг',
        description: 'Уникальный персонаж с особыми качествами',
      },
    }),
  ]);

  console.log('✅ Roles created:', roles.length);

  // Create characters
  const characters = await Promise.all([
    prisma.character.create({
      data: {
        name: 'Крокодил Тоша',
        description: 'Добрый и отзывчивый крокодил с большим сердцем. Всегда готов помочь друзьям и никогда не оставит никого в беде.',
        image: '/lovable-uploads/e273e373-a366-4fd1-a5db-6cbb095c564f.png',
        roleId: roles[0].id, // Главный герой
      },
    }),
    prisma.character.create({
      data: {
        name: 'Белочка Настя',
        description: 'Энергичная и весёлая белочка, которая обожает собирать орешки и помогать друзьям. Очень быстрая и ловкая.',
        image: '/lovable-uploads/feacc9db-2db0-4c54-b4bf-1d71a13c1b46.png',
        roleId: roles[1].id, // Лучший друг
      },
    }),
    prisma.character.create({
      data: {
        name: 'Ёжик Коля',
        description: 'Мудрый и рассудительный ёжик, который знает много интересных историй и всегда даёт хорошие советы.',
        image: '/lovable-uploads/e273e373-a366-4fd1-a5db-6cbb095c564f.png',
        roleId: roles[2].id, // Мудрый наставник
      },
    }),
    prisma.character.create({
      data: {
        name: 'Попугай Кеша',
        description: 'Яркий и говорливый попугай, который любит рассказывать истории и петь песни. Иногда бывает хитрым, но всегда добрым.',
        image: '/lovable-uploads/feacc9db-2db0-4c54-b4bf-1d71a13c1b46.png',
        roleId: roles[3].id, // Весёлый спутник
      },
    }),
    prisma.character.create({
      data: {
        name: 'Дедушка Черепаха',
        description: 'Самый мудрый житель пруда, который знает ответы на все вопросы и помогает молодым животным преодолевать трудности.',
        image: '/lovable-uploads/e273e373-a366-4fd1-a5db-6cbb095c564f.png',
        roleId: roles[4].id, // Мудрый старец
      },
    }),
    prisma.character.create({
      data: {
        name: 'Радужная рыбка Рина',
        description: 'Необычная рыбка, которая может менять свои цвета в зависимости от настроения. Учит других принимать различия.',
        image: '/lovable-uploads/feacc9db-2db0-4c54-b4bf-1d71a13c1b46.png',
        roleId: roles[5].id, // Особенный друг
      },
    }),
  ]);

  console.log('✅ Characters created:', characters.length);

  // Create sample story
  const story = await prisma.story.create({
    data: {
      title: 'Тоша и морская звезда',
      description: 'Добрый крокодил Тоша находит на пляже грустную морскую звезду и помогает ей вернуться домой в океан.',
      content: `
        <p>В одном прекрасном уголке мира, где солнце всегда светит ярко, а море плещется ласковыми волнами, жил добрый крокодил по имени Тоша. Он был необычным крокодилом – вместо того чтобы пугать других животных, он любил помогать им и заводить новых друзей.</p>
        
        <p>Однажды утром, когда солнце только начинало подниматься над горизонтом, Тоша решил прогуляться по морскому берегу. Он любил эти утренние прогулки, когда песок был ещё прохладным, а воздух наполнен свежестью.</p>
        
        <p>Вдруг он заметил что-то необычное на песке. Это была маленькая морская звезда, которая выглядела очень грустной. Её лучики были опущены, а обычно яркие цвета потускнели.</p>
        
        <p>— Привет! — осторожно позвал Тоша. — Что случилось? Почему ты такая грустная?</p>
        
        <p>Морская звезда подняла один из своих лучиков и тихо ответила:</p>
        
        <p>— Я заблудилась... Во время ночного прилива меня выбросило на берег, а теперь я не могу найти дорогу обратно в океан. Я так скучаю по своим друзьям и по своему дому среди коралловых рифов.</p>
        
        <p>Тоша сразу понял, что нужно помочь. Он аккуратно поднял морскую звезду и понёс её к воде.</p>
        
        <p>— Не волнуйся, я помогу тебе вернуться домой! — сказал он уверенно.</p>
        
        <p>По пути к океану они встретили краба, который тоже решил присоединиться к их путешествию. Краб был очень мудрым и знал все тайные тропинки морского дна.</p>
        
        <p>Вместе они отправились в удивительное путешествие по морским глубинам. Они проплыли мимо разноцветных кораллов, встретили стаю весёлых рыбок и даже увидели огромного, но очень доброго кита.</p>
        
        <p>Наконец они добрались до кораллового рифа, где жила морская звезда. Все её друзья очень обрадовались её возвращению!</p>
        
        <p>— Спасибо тебе, Тоша! — сказала морская звезда, сияя от счастья. — Ты настоящий друг!</p>
        
        <p>С тех пор Тоша часто навещал своих новых друзей в океане, а морская звезда всегда радостно махала ему своими лучиками, когда он проплывал мимо.</p>
        
        <p><strong>Мораль сказки:</strong> Дружба и помощь другим – это самое ценное, что у нас есть. Даже маленький добрый поступок может изменить чью-то жизнь к лучшему.</p>
      `,
      readTime: '5 мин',
      ageGroup: '4-6 лет',
      status: 'PUBLISHED',
      categoryId: categories[0].id, // Дружба
      authorId: adminUser.id,
    },
  });

  console.log('✅ Sample story created:', story.title);

  // Create story-character relationships
  await prisma.storyCharacter.createMany({
    data: [
      {
        storyId: story.id,
        characterId: characters[0].id, // Крокодил Тоша
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Story-character relationships created');

  // Create story illustrations
  await prisma.storyIllustration.createMany({
    data: [
      {
        storyId: story.id,
        imageUrl: '/lovable-uploads/feacc9db-2db0-4c54-b4bf-1d71a13c1b46.png',
        position: 'center',
        caption: 'Тоша гуляет по утреннему пляжу',
        order: 1,
      },
      {
        storyId: story.id,
        imageUrl: '/lovable-uploads/e273e373-a366-4fd1-a5db-6cbb095c564f.png',
        position: 'right',
        caption: 'Морская звезда, которая заблудилась',
        order: 2,
      },
      {
        storyId: story.id,
        imageUrl: '/lovable-uploads/feacc9db-2db0-4c54-b4bf-1d71a13c1b46.png',
        position: 'left',
        caption: 'Тоша несёт морскую звезду к воде',
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Story illustrations created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 