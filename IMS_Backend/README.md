# CoreInventory Backend

This is the cleaned-up backend for the CoreInventory system. It contains no dummy data.

## 1. Setup & Installation

### Prerequisites
*   Python 3.8+
*   PostgreSQL

### Installation Steps

1.  **Activate Virtual Environment**:
    ```powershell
    # Windows
    .\venv\Scripts\activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Database Migration**:
    Initialize the database schema:
    ```bash
    python manage.py migrate
    ```

## 2. First-Time Initialization

Since there is no dummy data, you must create an administrator account to access the system.

1.  **Create Superuser**:
    Run the following command and follow the prompts (enter username, email, and password):
    ```bash
    python manage.py createsuperuser
    ```

## 3. Running the Server

Start the development server:
```bash
python manage.py runserver
```

*   **API URL**: `http://localhost:8000/api/v1/`
*   **Admin Panel**: `http://localhost:8000/admin/`
*   **Swagger Docs**: `http://localhost:8000/api/docs/`

## 4. Initial Data Setup (Manual)

After logging into the Admin Panel (`/admin/`), you should populate these foundational items:

1.  **Units of Measure**: (e.g., Piece, kg, Liter)
2.  **Product Categories**: (e.g., Electronics, Furniture)
3.  **Warehouses**: Create at least one Warehouse.
4.  **Locations**: Create locations (Shelves, Bins) inside your Warehouse.

## 5. Security for Production

*   Update `.env` file:
    *   Set `DEBUG=False`
    *   Change `SECRET_KEY` to a random secure string.
    *   Update `ALLOWED_HOSTS` with your domain/IP.
