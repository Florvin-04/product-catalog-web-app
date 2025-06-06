import express from "express";
import cors from "cors";
const app = express();
const port = 5000;

// 🔽 Disable caching for all responses
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true, // if you use cookies or auth headers
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
