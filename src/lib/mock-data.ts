// Deterministic mock data for the AI US Equity Portfolio Consultant

export type RiskTier = "Low" | "Medium" | "High";

export const portfolioSummary = {
  value: 24_863_204.55,
  ytdReturn: 0.1842,
  riskTier: "Medium" as RiskTier,
  sharpe: 1.87,
  dailyChange: 0.0072,
  benchmarkYtd: 0.1421,
};

// Generate 24 months of performance
function genSeries(seed: number, drift: number, vol: number) {
  let v = 100;
  const out: number[] = [];
  for (let i = 0; i < 24; i++) {
    const r = Math.sin(seed + i * 1.3) * vol + drift;
    v = v * (1 + r);
    out.push(+v.toFixed(2));
  }
  return out;
}

const months = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, 0, 1);
  d.setMonth(d.getMonth() + i);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
});

const port = genSeries(1.1, 0.021, 0.028);
const sp = genSeries(2.4, 0.014, 0.022);
const nq = genSeries(3.7, 0.017, 0.034);

export const performanceSeries = months.map((m, i) => ({
  month: m,
  portfolio: port[i],
  sp500: sp[i],
  nasdaq: nq[i],
}));

export const rebalanceIn = [
  { ticker: "NVDA", name: "NVIDIA Corp.", current: 4.2, target: 8.5, conviction: 0.94, reason: "โมเดล LightGBM ประเมินว่า NVDA มี Factor Momentum และ Earnings Revision สูงสุดในกลุ่ม Semiconductor การเพิ่มน้ำหนักช่วยยก Sharpe Ratio จาก 1.87 → 2.04 ภายใต้ระดับความเสี่ยง Medium" },
  { ticker: "AAPL", name: "Apple Inc.", current: 6.8, target: 9.0, conviction: 0.88, reason: "กระแสเงินสดอิสระเติบโต 12% YoY และ Volatility ต่ำกว่าค่าเฉลี่ยพอร์ต 34% เหมาะเป็น Core Holding เพื่อลด Drawdown" },
  { ticker: "MSFT", name: "Microsoft Corp.", current: 5.5, target: 7.5, conviction: 0.86, reason: "การเติบโตของ Azure และรายได้ AI Copilot ทำให้ Alpha คาดการณ์อยู่ที่ +2.1% ต่อปีเทียบกับ S&P 500" },
];

export const rebalanceOut = [
  { ticker: "INTC", name: "Intel Corp.", current: 5.1, target: 1.5, conviction: 0.91, reason: "Beta สูงขึ้นแต่ Alpha ติดลบต่อเนื่อง 3 ไตรมาส สัญญาณ Factor Quality อ่อนแอ ลดน้ำหนักเพื่อควบคุม Max Drawdown" },
  { ticker: "BA", name: "Boeing Co.", current: 3.4, target: 0.8, conviction: 0.83, reason: "ความเสี่ยงเชิงปฏิบัติการเพิ่มขึ้น มี Idiosyncratic Risk เกินขอบเขต Risk Appetite ระดับ Medium" },
  { ticker: "F", name: "Ford Motor Co.", current: 2.8, target: 1.0, conviction: 0.78, reason: "Cyclical Exposure สูง ประกอบกับสัญญาณ Mean-Reversion เป็นลบในโมเดล 6 เดือน" },
];

export const dataPipelines = [
  { name: "US Equity Price Feed", source: "Polygon.io", status: "Healthy", latencyMs: 42, lastSync: "12 วินาทีที่แล้ว" },
  { name: "Fundamentals (SEC EDGAR)", source: "EDGAR API", status: "Healthy", latencyMs: 210, lastSync: "3 นาทีที่แล้ว" },
  { name: "Macro Indicators", source: "FRED", status: "Healthy", latencyMs: 88, lastSync: "1 นาทีที่แล้ว" },
  { name: "News & Sentiment", source: "Refinitiv", status: "Degraded", latencyMs: 1240, lastSync: "12 นาทีที่แล้ว" },
  { name: "AI Model Inference", source: "LightGBM v3.2", status: "Healthy", latencyMs: 68, lastSync: "30 วินาทีที่แล้ว" },
];
