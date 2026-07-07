import { Router, Request, Response } from "express";
import { buildTree, predict, Row } from "../services/decisionTree";
import { burnoutData } from "../data/burnoutData";

const router = Router();

const features = [
  "Sleep",
  "Meetings",
  "Workload",
  "Overtime",
  "Stress",
  "Remote",
  "Age",
  "ExperienceYears",
  "Gender",
  "Role",
  "Exercise",
];

const target = "Burnout";

let tree: any = buildTree(burnoutData, features, target);

router.post("/train", (req: Request, res: Response) => {
  const { data, features, target } = req.body;

  tree = buildTree(data, features, target);

  res.json({
    message: "Tree trained successfully",
    tree,
  });
});

router.post("/predict", (req: Request, res: Response) => {
  if (!tree) {
    return res.status(400).json({
      error: "Tree has not been trained yet",
    });
  }

  const row: Row = req.body;

  const prediction = predict(row, tree);

  res.json({
    prediction,
  });
});

router.get("/", (req: Request, res: Response) => {
  res.json(tree);
});
export default router;