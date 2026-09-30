# RESULTS.md — результати практичної роботи №4
## Варіант 3 — Одяг та взуття

### 1. Результат компіляції

Проєкт успішно компілюється командою:

```bash
npm run build
```

Очікуваний результат:

```text
Successfully compiled TypeScript project.
```

### 2. Запуск

Команда:

```bash
npm run start:dev
```

Після запуску NestJS реєструє контролер ресурсу:

```text
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [NestFactory] Starting Nest application...
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [InstanceLoader] AppModule dependencies initialized +5ms
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [RoutesResolver] ClothesController {/clothes}: +2ms
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [RouterExplorer] Mapped {/clothes, GET} route +1ms
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [RouterExplorer] Mapped {/clothes/:id, GET} route +1ms
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [RouterExplorer] Mapped {/clothes, POST} route +0ms
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [RouterExplorer] Mapped {/clothes/:id, PATCH} route +0ms
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [RouterExplorer] Mapped {/clothes/:id, DELETE} route +0ms
[Nest] 5567  - 09/30/2026, 12:54:58 PM     LOG [NestApplication] Nest application successfully started +1ms
```

### 3. GET /clothes

Запит:

```http
GET /clothes
```

Результат:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
X-Service-Status: operational
X-API-Version: 1.0
Content-Type: application/json; charset=utf-8
Content-Length: 343
ETag: W/"157-mnFmMuCoMLkP5TrZ0rstKf5buAE"
Date: Wed, 30 Sep 2026 09:56:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

Тіло містить три початкові записи:

```json
[
  {
    "id": "1",
    "title": "Футболка Basic",
    "price": 799,
    "size": "M",
    "material": "Бавовна",
    "color": "Чорний"
  },
  {
    "id": "2",
    "title": "Джинси Classic",
    "price": 2199,
    "size": "32",
    "material": "Денім",
    "color": "Синій"
  },
  {
    "id": "3",
    "title": "Худі Oversize",
    "price": 1899,
    "size": "L",
    "material": "Бавовна",
    "color": "Сірий"
  }
]
```

### 4. GET /clothes?search=футболка

Пошук за назвою виконується без урахування регістру.

Результат:

```http
HTTP/1.1 200 OK
```

Повертається товар `Футболка Basic`.

### 5. GET /clothes?search=а&limit=2

Сервіс спочатку виконує фільтрацію за назвою, після чого обмежує кількість результатів значенням `limit`.

Результат:

```http
HTTP/1.1 200 OK
```

Кількість елементів у відповіді не перевищує 2.

### 6. GET /clothes/1

Запит до існуючого ресурсу повертає:

```http
HTTP/1.1 200 OK
```

### 7. GET /clothes/99999

Для неіснуючого ID викликається `NotFoundException`.

Результат:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

Приклад тіла:

```json
{
  "message": "Сутність з ID 99999 не знайдена",
  "error": "Not Found",
  "statusCode": 404
}
```

### 8. POST /clothes

Тестове тіло:

```json
{
  "title": "Куртка Urban",
  "price": 3499,
  "size": "XL",
  "material": "Поліестер",
  "color": "Зелений"
}
```

Результат:

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

Сервіс генерує унікальний UUID та додає запис до in-memory сховища.

### 9. PATCH /clothes/1

Запит:

```json
{
  "price": 899,
  "color": "Білий"
}
```

Результат:

```http
HTTP/1.1 200 OK
```

Змінюються тільки передані поля, інші поля товару залишаються без змін.

### 10. DELETE /clothes/1

Результат:

```http
HTTP/1.1 204 No Content
```

Тіло відповіді відсутнє.

### 11. Перевірка після DELETE

Повторний:

```http
GET /clothes/1
```

повертає:

```http
HTTP/1.1 404 Not Found
```

### 12. Підсумок перевірки

| Сценарій                | Очікуваний статус | Реалізація |
|-------------------------|------------------:|------------|
| GET список              |               200 | +          |
| GET пошук               |               200 | +          |
| GET з limit             |               200 | +          |
| GET існуючого ID        |               200 | +          |
| GET неіснуючого ID      |               404 | +          |
| POST                    |               201 | +          |
| PATCH                   |               200 | +          |
| DELETE                  |               204 | +          |
| Перевірка після DELETE  |               404 | +          |
| Response headers        |          присутні | +          |

## Висновок

У межах практичної роботи розроблено REST API на базі NestJS для керування ресурсом одягу та взуття. Реалізовано модульну структуру із контролером і сервісом, constructor injection через IoC-контейнер NestJS, типізовані DTO, in-memory сховище та повний набір CRUD-операцій. Додатково реалізовано пошук за назвою, обмеження кількості результатів через `limit`, службові HTTP-заголовки та обробку ситуацій із відсутнім ресурсом через `NotFoundException`.
Файл `requests.http` містить готові запити для перевірки всіх основних сценаріїв API.
