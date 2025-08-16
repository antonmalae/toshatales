import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

// Тестовый токен (замените на реальный токен администратора)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testStatisticsAPI() {
  console.log('🧪 Тестирование API статистики...\n');

  const headers = {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Тест 1: Общая статистика
    console.log('1. Тестирование общей статистики...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/statistics`, { headers });
    console.log(`   Статус: ${dashboardResponse.status}`);
    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json();
      console.log('   ✅ Успешно получена общая статистика');
      console.log('   Данные:', JSON.stringify(data, null, 2));
    } else {
      console.log('   ❌ Ошибка получения общей статистики');
    }

    console.log('\n2. Тестирование отдельных метрик...');

    // Тест 2: Количество сказок
    const storiesResponse = await fetch(`${BASE_URL}/admin/statistics/stories`, { headers });
    console.log(`   Сказки - Статус: ${storiesResponse.status}`);
    if (storiesResponse.ok) {
      const data = await storiesResponse.json();
      console.log(`   ✅ Сказок: ${data.data.count}`);
    }

    // Тест 3: Количество персонажей
    const charactersResponse = await fetch(`${BASE_URL}/admin/statistics/characters`, { headers });
    console.log(`   Персонажи - Статус: ${charactersResponse.status}`);
    if (charactersResponse.ok) {
      const data = await charactersResponse.json();
      console.log(`   ✅ Персонажей: ${data.data.count}`);
    }

    // Тест 4: Количество категорий
    const categoriesResponse = await fetch(`${BASE_URL}/admin/statistics/categories`, { headers });
    console.log(`   Категории - Статус: ${categoriesResponse.status}`);
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json();
      console.log(`   ✅ Категорий: ${data.data.count}`);
    }

    // Тест 5: Количество ролей
    const rolesResponse = await fetch(`${BASE_URL}/admin/statistics/roles`, { headers });
    console.log(`   Роли - Статус: ${rolesResponse.status}`);
    if (rolesResponse.ok) {
      const data = await rolesResponse.json();
      console.log(`   ✅ Ролей: ${data.data.count}`);
    }

    // Тест 6: Количество медиафайлов
    const mediaResponse = await fetch(`${BASE_URL}/admin/statistics/media`, { headers });
    console.log(`   Медиа - Статус: ${mediaResponse.status}`);
    if (mediaResponse.ok) {
      const data = await mediaResponse.json();
      console.log(`   ✅ Медиафайлов: ${data.data.count}`);
    }

    console.log('\n🎉 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запуск теста
testStatisticsAPI(); 