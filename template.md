# Design Document: Equity Insights PDF Generator

This document outlines the technical architecture and layout for generating professional financial reports using `react-pdf` within a Next.js environment.

## 1. Technical Architecture

* **Framework:** Next.js (App Router).
* **PDF Engine:** `@react-pdf/renderer` (utilizing a declarative React-based approach).
* **Data Layer:** Prisma ORM fetching from PostgreSQL.
* **Styling:** `react-pdf` Stylesheets (Flexbox-based).

## 2. Page 1: Market Pulse (Dashboard)

The first page is designed as a "High-Conviction Dashboard" using a three-column layout.

### A. Header & Market Mood

* **Components:** `View` with `flexDirection: 'row'`.
* **Market Mood Indicator:** A horizontal bar component.
* **Logic:** `(Total Gainers / Total Tickers) * 100`.
* **Visual:** A dual-colored bar (Green/Red) representing the percentage of stocks that advanced vs. declined.



### B. Top 3 Gainers/Losers (Mini-Cards)

Instead of tables, use "Metric Cards."

* **Layout:** Three equal columns using `flex: 1`.
* **Elements:** * Ticker Symbol (Bold, 14pt).
* Current Price.
* Color-coded Badge: `bg: #e6fffa` for gainers, `bg: #fff5f5` for losers.
* Percentage change with an Up/Down arrow icon.



### C. The "Hot Tab" (Volume Leaders)

* **Logic:** Sort by `volume` DESC.
* **Focus:** Institutional interest. Lists the top 5 tickers with the highest raw trading volume.

### D. The "Shock Tab" (Unusual Volume)

* **Logic:** Filter `relativeVolume > 2.0`.
* **Focus:** Identifying outliers. These stocks are trading at more than double their 30-day average.

---

## 3. Calculated Metrics & Logic Implementation

Data will be processed in the Next.js API route before being passed to the React-PDF component.

| Metric | Prisma / JavaScript Logic | Purpose |
| --- | --- | --- |
| **Volume Conviction** | `change1DayPct * relativeVolume` | Scores the "strength" of a move. High scores indicate high-volume breakouts. |
| **Volatility Rank** | `StandardDeviation(priceData.map(p => p.change1DayPct))` | Uses the last 30 days of price changes to rank risk. |
| **52-Week High Distance** | `(currentPrice / maxPriceYear) - 1` | Identifies if a stock is at a resistance level or "breaking out." |
| **P/V Divergence** | `30dPriceChangePct` vs. `30dVolumeTrend` | Flags "Exhaustion": Price rising on decreasing volume is a warning sign. |

---

## 4. Integrated Chart Elements

Since `react-pdf` does not support standard HTML/SVG charting libraries (like Recharts) directly, charts must be rendered using the native `<Svg>`, `<Polyline>`, and `<Path>` components.

### A. Mini Sparklines (Price Trend)

* **Implementation:** Inside the "Top Gainers" table.
* **Logic:** Map the last 30 days of `closingPrice` to a set of X,Y coordinates.
* **Component:** `<Svg height="20" width="60"><Polyline points="..."/></Svg>`.

### B. Price Position Heatmap

* **Implementation:** A thin horizontal line representing the 52-week range (Low to High).
* **Indicator:** A small circle positioned on the line based on the current price.
* **Logic:** `(Current - Low) / (High - Low)`.

---

## 5. Detailed Category Layouts (Subsequent Pages)

These sections use standard `react-pdf` tables with alternating row colors for readability.

### Section 1: Momentum

* **Daily Leaders:** Top 10 by `change1DayPct`.
* **Monthly Leaders:** Top 10 by `change30DayPct`. Filter out "penny stocks" or low-volume noise to ensure quality insights.

### Section 2: Unusual Activity

* **The "Gap" List:** Highlights stocks where `openingPrice` (if available) or `lastTradedPrice` varies significantly from the previous `closingPrice`.
* **High Relative Volume:** Full table of any ticker exceeding `1.5x` its average volume.

### Section 3: Recovery (The "Bounce Back" Filter)

* **Logic:** `WHERE change1DayPct > 3 AND change30DayPct < -10`.
* **Focus:** Identifies stocks that were heavily sold off in the last month but are showing strong signs of reversal today.

---

## 6. CSS / Styling Specification (react-pdf)

```javascript
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#fff' },
  header: { fontSize: 20, marginBottom: 20, color: '#1a202c', borderBottom: 1 },
  columnWrapper: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { padding: 10, borderRadius: 4, border: '1pt solid #edf2f7', width: '30%' },
  positive: { color: '#38a169', fontWeight: 'bold' },
  negative: { color: '#e53e3e', fontWeight: 'bold' },
  tableHeader: { backgroundColor: '#f7fafc', padding: 5, flexDirection: 'row' },
  tableRow: { borderBottom: '0.5pt solid #edf2f7', padding: 5, flexDirection: 'row' }
});

```
