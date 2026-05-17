# Pytest Guide

> Pytest — потужний фреймворк для тестування на Python: unit, API, integration.

#pytest #automation #testing #python #api

---

## Overview

**Pytest** — найпопулярніший фреймворк для тестування в Python. Простий синтаксис, потужні fixtures, extensible plugins.

**Плюси:**
- Простий синтаксис (просто `assert`)
- Потужна система fixtures
- Parametrize — тести з різними даними
- Велика кількість плагінів
- Відмінна інтеграція з CI/CD

---

## Setup

### Installation

```bash
pip install pytest
pip install pytest-html          # HTML reports
pip install pytest-xdist         # паралельне виконання
pip install requests             # HTTP requests для API тестів
pip install pytest-mock          # mocking
```

### Project Structure

```
tests/
├── conftest.py              ← глобальні fixtures
├── unit/
│   └── test_calculator.py
├── api/
│   ├── conftest.py          ← API fixtures
│   └── test_users.py
└── integration/
    └── test_login_flow.py

pytest.ini                    ← конфігурація pytest
requirements.txt
```

### Configuration (pytest.ini)

```ini
[pytest]
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*

addopts = 
    -v
    --tb=short
    --html=reports/report.html
    --self-contained-html

markers =
    smoke: Smoke tests
    regression: Regression tests
    api: API tests
    slow: Slow tests
```

---

## Examples

### Unit Tests

```python
# tests/unit/test_calculator.py

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


class TestCalculator:
    def test_add_positive_numbers(self):
        assert add(2, 3) == 5

    def test_add_negative_numbers(self):
        assert add(-1, -2) == -3

    def test_divide_normal(self):
        assert divide(10, 2) == 5.0

    def test_divide_by_zero(self):
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            divide(10, 0)
```

### Fixtures

```python
# conftest.py
import pytest
import requests

@pytest.fixture(scope='session')
def base_url():
    return "https://reqres.in/api"

@pytest.fixture(scope='session')
def auth_token(base_url):
    """Отримати токен авторизації"""
    response = requests.post(
        f"{base_url}/login",
        json={"email": "eve.holt@reqres.in", "password": "cityslicka"}
    )
    assert response.status_code == 200
    return response.json()["token"]

@pytest.fixture(scope='function')
def api_client(base_url, auth_token):
    """HTTP клієнт з авторизацією"""
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    })
    session.base_url = base_url
    yield session
    session.close()

@pytest.fixture(scope='function', autouse=True)
def clean_up_test_data(api_client):
    """Автоматичне очищення після кожного тесту"""
    created_ids = []
    yield created_ids  # передаємо список у тест

    # Прибирання після тесту
    for user_id in created_ids:
        api_client.delete(f"{api_client.base_url}/users/{user_id}")
```

### API Tests with Requests

```python
# tests/api/test_users.py
import pytest
import requests


class TestUsersAPI:

    def test_get_user_list(self, base_url):
        response = requests.get(f"{base_url}/users", params={"page": 1})

        assert response.status_code == 200
        body = response.json()
        assert "data" in body
        assert len(body["data"]) > 0
        assert body["page"] == 1

    def test_get_single_user(self, base_url):
        response = requests.get(f"{base_url}/users/2")

        assert response.status_code == 200
        user = response.json()["data"]
        assert user["id"] == 2
        assert "@" in user["email"]
        assert user["first_name"]

    def test_get_nonexistent_user(self, base_url):
        response = requests.get(f"{base_url}/users/9999")

        assert response.status_code == 404

    def test_create_user(self, base_url, clean_up_test_data):
        payload = {
            "name": "Alice",
            "job": "QA Engineer"
        }
        response = requests.post(f"{base_url}/users", json=payload)

        assert response.status_code == 201
        user = response.json()
        assert user["name"] == "Alice"
        assert user["job"] == "QA Engineer"
        assert "id" in user

        # Зберігаємо ID для очищення
        clean_up_test_data.append(user["id"])

    def test_update_user(self, base_url):
        response = requests.put(
            f"{base_url}/users/2",
            json={"name": "Updated Name", "job": "Senior QA"}
        )

        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

    def test_delete_user(self, base_url):
        response = requests.delete(f"{base_url}/users/2")
        assert response.status_code == 204

    def test_response_time_under_500ms(self, base_url):
        import time
        start = time.time()
        response = requests.get(f"{base_url}/users")
        elapsed = (time.time() - start) * 1000

        assert response.status_code == 200
        assert elapsed < 500, f"Response time {elapsed:.0f}ms exceeds 500ms"
```

### Parametrize

```python
import pytest

@pytest.mark.parametrize("email,password,expected_status", [
    ("user@test.com", "correct_pass", 200),
    ("user@test.com", "wrong_pass", 400),
    ("", "password", 400),
    ("notanemail", "password", 400),
    ("user@test.com", "", 400),
])
def test_login_scenarios(base_url, email, password, expected_status):
    response = requests.post(
        f"{base_url}/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == expected_status


@pytest.mark.parametrize("user_id", [1, 2, 3, 5, 10])
def test_get_valid_users(base_url, user_id):
    response = requests.get(f"{base_url}/users/{user_id}")
    assert response.status_code == 200
```

### Marks and Filtering

```python
import pytest

@pytest.mark.smoke
def test_homepage_loads(base_url):
    response = requests.get(base_url)
    assert response.status_code == 200

@pytest.mark.regression
@pytest.mark.api
def test_full_user_flow(base_url):
    # Create → Read → Update → Delete
    pass

@pytest.mark.slow
def test_large_dataset(base_url):
    pass

@pytest.mark.skip(reason="Feature not implemented yet")
def test_new_feature():
    pass

@pytest.mark.xfail(reason="Known bug #123")
def test_known_bug():
    assert False
```

### Mocking

```python
from unittest.mock import patch, MagicMock

def send_email(address: str, subject: str) -> bool:
    # Реальна логіка відправки
    import smtplib
    # ...
    return True

def test_email_sent_on_registration(user_service):
    with patch('myapp.email.send_email') as mock_send:
        mock_send.return_value = True
        
        user_service.register("alice@test.com", "password")
        
        mock_send.assert_called_once_with(
            "alice@test.com",
            "Welcome to our platform!"
        )
```

---

## pytest Commands

```bash
# Запустити всі тести
pytest

# Конкретний файл
pytest tests/api/test_users.py

# Конкретна функція
pytest tests/api/test_users.py::TestUsersAPI::test_get_user_list

# За маркером
pytest -m smoke
pytest -m "api and not slow"
pytest -m "regression or smoke"

# Verbose
pytest -v

# Зупинитись при першій помилці
pytest -x
pytest --exitfirst

# Останні N невдалих тестів
pytest --lf   # last failed
pytest --ff   # failed first

# Паралельне виконання
pytest -n 4        # 4 потоки
pytest -n auto     # авто

# HTML звіт
pytest --html=reports/report.html --self-contained-html

# Coverage
pytest --cov=myapp --cov-report=html

# Показати print() виводи
pytest -s
```

---

## Best Practices

1. **`conftest.py`** для shared fixtures
2. **Scope fixtures** правильно: `session` для одноразових, `function` для ізольованих
3. **`pytest.mark`** для класифікації тестів
4. **`parametrize`** замість дублювання тестів
5. **`autouse=True`** для cleanup fixtures
6. **Ізольовані тести** — кожен тест незалежний
7. **Assertions з повідомленнями**: `assert x == y, f"Expected {y}, got {x}"`

---

## Related Notes

- [[Selenium Guide]] — Python + Selenium
- [[API Testing Overview]] — API тестування
- [[Framework Comparison]] — порівняння фреймворків
- [[CI-CD Overview]] — Pytest у CI/CD
- [[Automation Testing Index]] — головна сторінка
