# Stock Price Prediction API

A Flask application that predicts stock prices using machine learning models trained on historical CSV data.

## Supported Stocks

- **TCS** (Tata Consultancy Services)
- **Infosys**
- **ITC**
- **Yes Bank**
- **HDFC**

## Machine Learning Models

The API uses three regression models for predictions:

1. **Linear Regression** (`lr`)
2. **Decision Tree Regressor** (`dt`)
3. **Random Forest Regressor** (`rf`)

## How It Works

1. The application reads historical stock data from CSV files for each supported stock
2. Three ML models are trained using Date → Close Price relationships
3. Users send a date to the API to get price predictions
4. The API returns predictions from all models along with confidence scores (R² score)

## Installation & Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
.\venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the Backend Server

```bash
python app.py
```