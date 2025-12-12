const stockData = {};
const stockFiles = {
  tcs: "tcs.csv",
  infosys: "infy.csv",
  itc: "itc.csv",
  yesbank: "yes.csv",
  hdfc: "hdfc.csv"
};

let chart;
let maChart;

// Load CSV
async function loadCSV(stock) {
  if (stockData[stock]) return stockData[stock];
  const file = stockFiles[stock];
  const res = await fetch(file);
  const text = await res.text();
  const rows = text.split("\n").slice(1).filter(r => r.trim() !== "");

  stockData[stock] = rows.map(row => {
    const [date, close] = row.split(",");
    return { date: date.trim(), close: parseFloat(close) };
  });

  return stockData[stock];
}

// ================= MOVING AVERAGE CALCULATION =================
function calculateMovingAverages(data) {
  const closes = data.map(d => d.close);

  const MA50 = closes.map((v, i, arr) =>
    i >= 50 ? arr.slice(i - 50, i).reduce((a, b) => a + b) / 50 : null
  );

  const MA200 = closes.map((v, i, arr) =>
    i >= 200 ? arr.slice(i - 200, i).reduce((a, b) => a + b) / 200 : null
  );

  return { MA50, MA200 };
}

// ================= PREDICT BUTTON =================
document.getElementById("predict-btn").addEventListener("click", async () => {
  const stock = document.getElementById("stock-select").value;
  const model = document.getElementById("model-select").value;
  const date = document.getElementById("date-input").value;

  if (!stock || !model || !date) {
    alert("Please select stock, model, and date before predicting!");
    return;
  }

  const data = await loadCSV(stock);

  try {
    const res = await fetch(
      `http://localhost:5000/predict?stock=${stock}&model=${model}&date=${date}`
    );
    const result = await res.json();

    const prediction = result.predictions[model].value;
    const conf = getConfidence(result.predictions[model].confidence * 100);

    // Update Summary
    document.getElementById("summary").style.display = "block";
    document.getElementById("summary-stock").textContent = stock.toUpperCase();
    document.getElementById("summary-model").textContent = modelFullName(model);
    document.getElementById("summary-date").textContent = formatDateDisplay(date);
    document.getElementById("summary-prediction").textContent = `₹${prediction}`;
    document.getElementById("confidence").textContent = conf;

    // Charts
    updateChart(stock, data, prediction, date);

  } catch (err) {
    console.error("Prediction fetch error:", err);
    alert("Error fetching prediction. Please check your Flask server.");
  }
});

// ================= LOGOUT =================
document.getElementById("logout").addEventListener("click", () => {
  alert("You have been logged out.");
  window.location.replace("login.html");
});

// ================= CHART UPDATE =================
function updateChart(stock, data, prediction, date) {
  document.getElementById("chart-section").style.display = "block";
  document.getElementById("ma-chart-section").style.display = "block";
  document.getElementById("stock-name").textContent = stock.toUpperCase();

  const labels = data.map(d => d.date);
  const prices = data.map(d => d.close);

  const ctx = document.getElementById("stockChart").getContext("2d");
  if (chart) chart.destroy();

  const predictedLabel = new Date(date).toLocaleString("default", { month: "short", year: "numeric" });

  // ========== MAIN PRICE CHART ==========
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [...labels, predictedLabel],
      datasets: [
        {
          label: "Historical",
          data: prices,
          borderColor: "#2E8B57",
          backgroundColor: "rgba(46,139,87,0.15)",
          fill: true,
          tension: 0.4
        },
        {
          label: "Predicted",
          data: [...Array(prices.length).fill(null), prediction],
          borderColor: "transparent",
          backgroundColor: "#000",
          pointRadius: 6,
          showLine: false
        }
      ]
    },
    options: {
      scales: {
        x: { grid: { display: false } }, // Remove vertical lines
        y: { grid: { display: false } }  // Remove horizontal lines
      }
    }
  });

  // ========== MOVING AVERAGE CHART ==========
  const ma = calculateMovingAverages(data);
  const ctx2 = document.getElementById("maChart").getContext("2d");

  if (maChart) maChart.destroy();

  maChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "50-Day MA",
          data: ma.MA50,
          borderColor: "blue",
          borderWidth: 1.6,     // Thin line
          fill: false,
          tension: 0.35         // Smooth
        },
        {
          label: "200-Day MA",
          data: ma.MA200,
          borderColor: "red",
          borderWidth: 1.6,     // Thin line
          fill: false,
          tension: 0.35         // Smooth
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "black", font: { size: 14 } }
        }
      },
      scales: {
        x: { grid: { display: false } }, // Remove gridlines
        y: { grid: { display: false } }
      }
    }
  });
}

// ========== HELPERS ==========
function getConfidence(conf) {
  if (conf >= 70) return "High";
  if (conf >= 40) return "Medium";
  return "Low";
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("default", { day: "2-digit", month: "short", year: "numeric" });
}

function modelFullName(model) {
  return { lr: "Linear Regression", dt: "Decision Tree", rf: "Random Forest" }[model] || model;
}
