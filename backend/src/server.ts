import express from "express";
import cors from "cors";
import treeRoutes from "./routes/treeRoutes";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/tree", treeRoutes);

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Backend is working!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});