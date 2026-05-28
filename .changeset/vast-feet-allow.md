---
"@cloudflare/kumo": patch
---

echarts is now an optional peer dependency. If you don't use Chart components (Chart, TimeseriesChart, SankeyChart), it will no longer be installed automatically. If you do use them, run npm install echarts (as documented).
