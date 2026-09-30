# Практична робота № 4

## Тема: Розроблення REST-ендпоінтів засобами NestJS

---

## Мета роботи

- Опанувати архітектурні засади фреймворку NestJS: модульну організацію, інверсію керування (IoC) та ін'єкцію залежностей (Dependency Injection).
- Навчитися створювати та конфігурувати проєкт за допомогою `@nestjs/cli`, дослідити призначення вхідної точки застосунку `main.ts` та кореневого модуля `AppModule`.
- Опанувати розробку REST-контролерів (`controllers`) із маршрутизацією через декоратори методів (`@Get`, `@Post`, `@Patch`, `@Delete`).
- Навчитися витягувати дані з HTTP-запитів за допомогою декораторів параметрів (`@Param`, `@Query`, `@Body`, `@Headers`) та формувати типізовані контракти DTO (Data Transfer Objects).
- Реалізувати інкапсуляцію бізнес-логіки в сервісному провайдері (`service provider`) з in-memory сховищем та налаштувати коректні HTTP-статуси й виключення (`HttpException`, `NotFoundException`).

---

## Технічне забезпечення

- Операційна система: Windows, macOS або Linux.
- Середовище розробки: Visual Studio Code (із розширенням REST Client або Thunder Client).
- Платформа виконання: Node.js версії 18+ (LTS) та пакетний менеджер npm.
- Глобальні або локальні інструменти CLI: NestJS CLI (`@nestjs/cli`).
- Інструменти тестування API: Postman, розширення REST Client (`requests.http`) або утиліта `curl`.
- Термінал / CLI: bash, zsh або PowerShell.
- Система контролю версій: Git.

---

## Короткі теоретичні відомості

### 1. Архітектура NestJS та життєвий цикл запиту

NestJS — це прогресивний TypeScript-фреймворк для розробки масштабованих серверних застосунків. Його архітектура базується на трьох ключових елементах:
- **Модулі (`@Module`):** організовують структуру застосунку у функціональні блоки;
- **Контролери (`@Controller`):** приймають вхідні HTTP-запити та повертають клієнту клієнтські HTTP-відповіді;
- **Провайдери / Сервіси (`@Injectable`):** інкапсулюють бізнес-логіку та роботу зі сховищем даних, впроваджуються через Dependency Injection.

Точка входу `src/main.ts` ініціалізує екземпляр застосунку за допомогою фабрики `NestFactory`:

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

---

### 2. Контролери, маршрутизація та декоратори параметрів

Контролер відповідає за обробку маршрутів (`routing`). Префікс маршруту визначається у декораторі `@Controller('path')`.

Для роботи з HTTP-запитом NestJS надає набір декларативних декораторів:
- `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` — прив'язка методу класу до відповідного HTTP-методу;
- `@Param(key?: string)` — отримання параметрів маршруту (route params), наприклад `:id`;
- `@Query(key?: string)` — отримання рядка запиту (query params), наприклад `?page=1&limit=10`;
- `@Body(key?: string)` — отримання тіла запиту (request payload / DTO);
- `@Headers(key?: string)` — читання HTTP-заголовків запиту;
- `@HttpCode(status: number)` — явне встановлення статусу відповіді (за замовчуванням NestJS повертає `200 OK` для всіх методів, окрім `POST`, для якого повертається `201 Created`).

Приклад контролера блогу (`ArticlesController`):

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";

@Controller("articles")
export class ArticlesController {
  @Get()
  findAll(@Query("search") search?: string) {
    return { query: search, items: [] };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    if (id === "0") {
      throw new NotFoundException(`Статтю з ID ${id} не знайдено`);
    }
    return { id, title: "Вступ до NestJS" };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() payload: { title: string; content: string }) {
    return { id: "generated-uuid", ...payload };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    // 204 No Content не повертає тіло відповіді
  }
}
```

---

### 3. Об'єкти передачі даних (DTO — Data Transfer Objects)

DTO — це клас, що визначає контракт і структуру даних, які передаються через мережу. Використання класів замість інтерфейсів є обов'язковим стандартом у NestJS, оскільки класи зберігаються в JavaScript після компіляції і дозволяють здійснювати рантайм-валідацію.

```typescript
export class CreateArticleDto {
  readonly title: string;
  readonly content: string;
  readonly tags?: string[];
}

export class UpdateArticleDto {
  readonly title?: string;
  readonly content?: string;
  readonly tags?: string[];
}
```

---

### 4. Провайдери та ін'єкція залежностей (Dependency Injection)

Контролери не повинні зберігати дані або виконувати складну бізнес-логіку. Для цього створюються сервіси, позначені декоратором `@Injectable()`. Контролер отримує екземпляр сервісу через конструктор (**constructor injection**), а керування життєвим циклом бере на себе IoC-контейнер NestJS:

```typescript
// articles.service.ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class ArticlesService {
  private readonly articles: Array<{ id: string; title: string }> = [];

  findAll() {
    return this.articles;
  }
}

// articles.controller.ts
@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getAll() {
    return this.articlesService.findAll();
  }
}
```

---

## Постановка задачі

Для створення масштабованого бекенду інтернет-магазину необхідно розробити стандартизований REST API контролер для управління ресурсами предметної області.

У межах практичної роботи необхідно створити новий проєкт NestJS за допомогою CLI, згенерувати окремий ресурсний модуль або контролер та реалізувати повний спектр операцій CRUD (Create, Read, Update, Delete) із підтримкою query-фільтрації, використанням типізованих DTO, обробкою HTTP-виключень та in-memory сервісом.

Предметна категорія та специфіка полів сутності визначаються індивідуальним **варіантом за номером у журналі**:

<<<

### Таблиця варіантів ресурсної сутності

| Варіант | Категорія магазину | Базовий префікс маршруту | Специфічні поля DTO створення (`CreateDto`) |
|:---:|---|---|---|
| **1** | Електроніка та гаджети | `/gadgets` | `title`, `price`, `warrantyMonths`, `cpu`, `ramGb` |
| **2** | Книжковий онлайн-магазин | `/books` | `title`, `price`, `isbn`, `pageCount`, `author` |
| **3** | Одяг та взуття | `/clothes` | `title`, `price`, `size`, `material`, `color` |
| **4** | Доставка їжі та ресторанів | `/dishes` | `title`, `price`, `weightGrams`, `calories`, `isSpicy` |
| **5** | Онлайн-аптека | `/medicines` | `title`, `price`, `dosageMg`, `isPrescriptionRequired`, `expirationDate` |
| **6** | Будівельні матеріали | `/materials` | `title`, `price`, `unitOfMeasure`, `weightPerUnitKg`, `isHeavyCargo` |
| **7** | Автозапчастини | `/auto-parts` | `title`, `price`, `oemCode`, `condition`, `carBrand` |
| **8** | Квитки на події | `/tickets` | `title`, `price`, `venue`, `sector`, `seatNumber` |
| **9** | Онлайн-курси та підписки | `/courses` | `title`, `price`, `durationHours`, `difficultyLevel`, `instructor` |
| **10** | Зоотовари | `/pet-supplies` | `title`, `price`, `petCategory`, `packageWeightKg`, `brand` |

> Якщо номер у журналі перевищує 10, варіант обчислюється за формулою: `((номер - 1) % 10) + 1`.

---

## Завдання

Практична робота складається з трьох послідовних рівнів. Кожен наступний рівень базується на попередньому та розширює функціональність розроблюваного рішення.

---

### Рівень 1. Базовий: створення NestJS проєкту та оголошення ендпоінтів

1. **Ініціалізація проєкту за допомогою CLI:**
   - Встановити глобально або використати через `npx` утиліту NestJS CLI:
     ```bash
     npx @nestjs/cli new online-store --strict --package-manager npm
     ```
   - Запустити сервер у режимі розробки: `npm run start:dev` і перевірити відповідь за адресою `http://localhost:3000`.

2. **Генерація контролера предметної області:**
   - За допомогою команди CLI згенерувати контролер відповідно до свого варіанта (наприклад, для варіанта 1: `gadgets`):
     ```bash
     npx @nestjs/cli g co gadgets --no-spec
     ```
   - Переконатися, що контролер автоматично зареєструвався в масиві `controllers` кореневого `AppModule`.

3. **Створення контрактів DTO:**
   - Створити каталог `src/<resource>/dto/`.
   - Оголосити клас `Create<Resource>Dto` з обов'язковими полями відповідно до варіанта.
   - Оголосити клас `Update<Resource>Dto` з опціональними полями.

4. **Реалізація базових методів контролера:**
   - Реалізувати метод `@Get()` — повертає тестовий масив сутностей.
   - Реалізувати метод `@Get(':id')` — зчитує параметр ідентифікатора через `@Param('id')` та повертає знайдений об'єкт.
   - Реалізувати метод `@Post()` — приймає тіло запиту через `@Body() createDto: Create<Resource>Dto` та повертає сформований об'єкт із присвоєним ідентифікатором.

---

### Рівень 2: повний REST CRUD, HTTP-статуси та In-Memory Service

1. **Створення сервісного провайдера (Service Provider):**
   - Згенерувати сервіс через CLI:
     ```bash
     npx @nestjs/cli g s <resource> --no-spec
     ```
   - Оголосити всередині сервісу приватне in-memory сховище:
     `private items: Entity[] = [];` (заповнити його 2–3 початковими тестовими записами).

2. **Реалізація методів сервісу з обробкою виключень:**
   - `findAll()` — повертає всі елементи сховища.
   - `findOne(id: string)` — шукає елемент за `id`. Якщо елемент не знайдено — генерувати стандартне HTTP-виключення NestJS:
     `throw new NotFoundException(`Сутність з ID ${id} не знайдена`);`
   - `create(dto: Create<Resource>Dto)` — формує новий запис з унікальним `id` (наприклад, через `Date.now().toString()` або `randomUUID()`) та додає його в масив.
   - `update(id: string, dto: Update<Resource>Dto)` — знаходить сутність за `id` (якщо немає — `NotFoundException`), оновлює лише передані поля та повертає актуалізований запис.
   - `remove(id: string)` — видаляє сутність за `id` (якщо немає — `NotFoundException`).

3. **Підключення сервісу до контролера (Dependency Injection):**
   - Впровадити сервіс у контролер через конструктор (`constructor injection`).
   - Делегувати виконання методів контролера відповідним методам сервісу.
   - Для методу `@Delete(':id')` налаштувати повернення статусу `204 No Content` за допомогою декоратора `@HttpCode(HttpStatus.NO_CONTENT)`.
   - Для методу `@Post()` явно встановити статус `201 Created` через `@HttpCode(HttpStatus.CREATED)`.

---

### Рівень 3. Просунутий: Query-фільтрація, кастомні Headers та API-тестування

1. **Реалізація пошуку та пагінації через Query Params:**
   - Модифікувати метод `@Get()` контролера, додавши читання параметрів рядка запиту:
     - `@Query('search') search?: string` — пошук за підрядком у назві (`title`);
     - `@Query('limit') limit?: string` — обмеження кількості записів у видачі.
   - Реалізувати відповідну логіку фільтрації у сервісі (пошук без урахування регістру `toLowerCase()`).

2. **Керування HTTP-заголовками відповіді:**
   - За допомогою декларативного декоратора `@Header('X-API-Version', '1.0')` додати службовий заголовок версії API до методу `@Get()`.
   - Налаштувати кастомний response-заголовок `@Header('X-Service-Status', 'operational')`.

3. **Комплексне тестування та звітність (REST Client / Postman):**
   - Створити у корені проєкту файл `requests.http` для розширення VS Code REST Client (або експортувати колекцію Postman):
     - `GET http://localhost:3000/<resource>` — перевірка отримання списку;
     - `GET http://localhost:3000/<resource>?search=...` — перевірка фільтрації;
     - `GET http://localhost:3000/<resource>/1` — успішне отримання існуючого запису;
     - `GET http://localhost:3000/<resource>/99999` — перевірка обробки `404 Not Found`;
     - `POST http://localhost:3000/<resource>` із валідним JSON-тілом — перевірка `201 Created`;
     - `PATCH http://localhost:3000/<resource>/:id` — часткове оновлення;
     - `DELETE http://localhost:3000/<resource>/:id` — перевірка видалення зі статусом `204 No Content`.
   - Зафіксувати результати тестування у файлі `README.md`.

---

## Приклад очікуваного виведення програми

```text
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [NestFactory] Starting Nest application...
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [InstanceLoader] AppModule dependencies initialized +8ms
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [RoutesResolver] GadgetsController {/gadgets}: +5ms
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [RouterExplorer] Mapped {/gadgets, GET} route +2ms
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [RouterExplorer] Mapped {/gadgets/:id, GET} route +1ms
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [RouterExplorer] Mapped {/gadgets, POST} route +1ms
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [RouterExplorer] Mapped {/gadgets/:id, PATCH} route +1ms
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [RouterExplorer] Mapped {/gadgets/:id, DELETE} route +1ms
[Nest] 14820  - 09/09/2026, 21:50:00     LOG [NestApplication] Nest application successfully started on port 3000 +2ms

=== ТЕСТУВАННЯ ЕНДПОІНТІВ ЧЕРЕЗ HTTP КЛІЄНТ ===

> POST /gadgets HTTP/1.1
> Host: localhost:3000
> Content-Type: application/json
{
  "title": "Ноутбук Pro 16",
  "price": 45000,
  "warrantyMonths": 24,
  "cpu": "M3 Max",
  "ramGb": 36
}

< HTTP/1.1 201 Created
< Content-Type: application/json; charset=utf-8
{
  "id": "1725911400123",
  "title": "Ноутбук Pro 16",
  "price": 45000,
  "warrantyMonths": 24,
  "cpu": "M3 Max",
  "ramGb": 36
}

> GET /gadgets/non-existent-id HTTP/1.1
< HTTP/1.1 404 Not Found
< Content-Type: application/json; charset=utf-8
{
  "message": "Сутність з ID non-existent-id не знайдена",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Контрольні питання

1. Що таке інверсія керування (`Inversion of Control`) та як принцип `Dependency Injection` реалізований у NestJS?
2. Яка різниця між модулем (`@Module`), контролером (`@Controller`) та провайдером (`@Injectable`)?
3. Чому для створення DTO у NestJS використовуються класи TypeScript, а не інтерфейси (`interfaces`)?
4. Які декоратори надає NestJS для витягування параметрів запиту (`route params`, `query params`, `body payload`)? Наведіть приклади їх застосування.
5. Який HTTP-статус за замовчуванням повертає метод контролера NestJS для операцій `GET`, `POST` та `DELETE`? Як змінити статус відповіді за допомогою декоратора `@HttpCode()`?
6. Як працює вбудована система обробки виключень NestJS? Що повертає фреймворк клієнту при виклику `throw new NotFoundException()`?
7. Як за допомогою декоратора `@Header()` додати кастомний HTTP-заголовок до відповіді сервера?
8. У чому полягає відмінність між HTTP-методами `PUT` та `PATCH` під час проєктування RESTful API?

---

## Критерії оцінювання

Оцінювання здійснюється за шкалою повноти реалізації рівнів практичної роботи:

- **«Задовільно» (Рівень 1):** реалізовано базовий прототип, створено структуру проєкту, програма успішно компілюється та виконує базові сценарії.
- **«Добре» (Рівень 2):** виконано базовий рівень та реалізовано ключову функціональність заняття, забезпечено надійність і безпеку виконання коду.
- **«Відмінно» (Рівень 3):** повністю завершено всі три рівні завдання з дотриманням кращих інженерних практик, чистоти архітектури та оптимізації.
- **Усний захист:** обов'язкове пояснення логіки коду та впевнені відповіді на контрольні питання викладача.

## Вимоги до звітності

1. Опублікувати вихідний код у Git-репозиторії.
2. Оформити файл `README.md` з описом проєкту, інструкцією запуску та обов'язковими скриншотами роботи програми (включаючи демонстрацію відсутності помилок).
3. Продемонструвати роботу програми викладачеві та захистити результати.
