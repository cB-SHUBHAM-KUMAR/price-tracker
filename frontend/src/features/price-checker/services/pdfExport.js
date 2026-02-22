/**
 * @fileoverview Client-side PDF report generation.
 * Uses a new window with styled HTML that triggers browser print/save as PDF.
 */

const POSITION_COLORS = {
  Underpriced: '#22c55e',
  Fair: '#6366f1',
  'Slightly Overpriced': '#f59e0b',
  Overpriced: '#ef4444',
  'Significantly Overpriced': '#dc2626',
};

/**
 * Generates a styled HTML report and opens print dialog.
 * @param {Object} data - The analysis result data
 */
export function exportAnalysisAsPDF(data) {
  const posColor = POSITION_COLORS[data.pricePosition] || '#6366f1';
  const currency = data.input?.currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  const formatPrice = (p) => `${symbol}${(p || 0).toLocaleString('en-IN')}`;

  const surgeHTML = data.surgeDetected
    ? `<div class="surge-badge surge-detected">⚡ Surge Detected — Level: ${data.surgeLevel}, Score: ${data.dynamicScore}/100</div>`
    : `<div class="surge-badge">✅ No Surge Detected</div>`;

  const demandsHTML = (data.demandSignals || [])
    .map((s) => `<li>${s}</li>`)
    .join('');

  const timelineHTML = data.priceTimeline
    ? `<div class="section">
        <h3>📅 Best Time to Buy</h3>
        <p><strong>Best months:</strong> ${data.priceTimeline.bestMonths?.join(', ') || 'N/A'}</p>
        <p><strong>Peak months:</strong> ${data.priceTimeline.peakMonths?.join(', ') || 'N/A'}</p>
        <ul>${(data.priceTimeline.tips || []).slice(0, 3).map((t) => `<li>${t}</li>`).join('')}</ul>
      </div>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Price Analysis Report — PriceFair</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #6366f1; }
    .header h1 { font-size: 24px; color: #6366f1; margin-bottom: 4px; }
    .header p { color: #64748b; font-size: 12px; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; color: white; background: ${posColor}; margin: 10px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
    .card h4 { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .card .value { font-size: 22px; font-weight: 700; color: #1e293b; }
    .card .value.green { color: #16a34a; }
    .section { margin: 24px 0; }
    .section h3 { font-size: 14px; color: #334155; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    .recommendation { background: linear-gradient(135deg, ${posColor}15, ${posColor}08); border: 1px solid ${posColor}40; border-radius: 10px; padding: 16px; margin: 16px 0; }
    .recommendation h4 { color: ${posColor}; font-size: 16px; margin-bottom: 6px; }
    .recommendation p { color: #475569; font-size: 13px; line-height: 1.5; }
    .surge-badge { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; background: #f0fdf4; color: #16a34a; margin: 8px 0; }
    .surge-detected { background: #fef2f2; color: #dc2626; }
    .confidence { text-align: center; margin: 16px 0; }
    .confidence .score { font-size: 36px; font-weight: 700; color: #6366f1; }
    .confidence .label { color: #64748b; font-size: 12px; }
    ul { padding-left: 18px; }
    li { font-size: 13px; color: #475569; margin: 4px 0; }
    .ai-reasoning { background: #f1f5f9; border-radius: 8px; padding: 14px; font-size: 13px; color: #334155; line-height: 1.6; }
    .footer { text-align: center; margin-top: 30px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>💰 PriceFair — Price Analysis Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>

  <div style="text-align:center">
    <span class="badge">${data.pricePosition || 'Analyzed'}</span>
  </div>

  <div class="grid">
    <div class="card">
      <h4>Current Price</h4>
      <div class="value">${formatPrice(data.currentPrice)}</div>
    </div>
    <div class="card">
      <h4>Fair Price</h4>
      <div class="value green">${formatPrice(data.fairPrice)}</div>
    </div>
    <div class="card">
      <h4>Price Range</h4>
      <div class="value" style="font-size:16px">${formatPrice(data.fairPriceRange?.low)} — ${formatPrice(data.fairPriceRange?.high)}</div>
    </div>
    <div class="card">
      <h4>Price Deviation</h4>
      <div class="value" style="font-size:16px">${data.priceDeviation ? (data.priceDeviation > 0 ? '+' : '') + data.priceDeviation + '%' : 'N/A'}</div>
    </div>
  </div>

  <div class="recommendation">
    <h4>${data.buyRecommendation || 'Analysis Complete'}</h4>
    <p>${data.reasoningSummary || ''}</p>
  </div>

  <div class="confidence">
    <div class="score">${data.confidenceScore || 0}%</div>
    <div class="label">Confidence Score</div>
  </div>

  ${surgeHTML}

  ${demandsHTML ? `
  <div class="section">
    <h3>📊 Demand Signals</h3>
    <ul>${demandsHTML}</ul>
  </div>
  ` : ''}

  ${data.aiReasoning ? `
  <div class="section">
    <h3>🧠 AI Reasoning</h3>
    <div class="ai-reasoning">${data.aiReasoning}</div>
  </div>
  ` : ''}

  ${timelineHTML}

  <div class="footer">
    <p>Report generated by PriceFair • Dynamic Price Checker</p>
    <p>This analysis is for informational purposes only. Prices may vary.</p>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
