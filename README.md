# Интернет-магазин еды (Сортировка) — MVP

## Запуск

1. Загрузите файлы `index.html`, `app.jsx`, `.nojekyll`, `README.md` в репозиторий на GitHub (корень).
2. Включите GitHub Pages: Settings → Pages → Source → Deploy from a branch → main/ (root).
3. Через 1–2 минуты сайт будет доступен по ссылке `https://username.github.io/repo`.

## Админка

Для входа: откройте `?admin=1111`  
Пример: `https://username.github.io/repo?admin=1111`

## Сброс данных

В DevTools → Application/Storage → localStorage удалите ключи:

- `store_products_v1`
- `store_settings_v1`

## Особенности

- Все данные и настройки хранятся в localStorage (только на устройстве).
- Нет серверной части: нет синхронизации между устройствами, нет трекинга курьера.
- Быстрый рендер, все на одной странице.
- Любые ошибки JS показываются в оверлее.
- Оформление заказа отправляется в WhatsApp.
- CRUD товаров и настройка магазина — через админку.

## Лицензия

MIT