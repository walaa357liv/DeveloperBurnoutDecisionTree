export type Row = {
  [key: string]: string | number;
};

export type TreeNode = {
  prediction?: string;

  feature?: string;

  splitType?: "numeric" | "categorical";

  threshold?: number | undefined;
  
  value?: string | undefined;

  left?: TreeNode;
  right?: TreeNode;
};

function getUniqueValues(data: Row[], target: string): string[] {
  const values = new Set<string>();

  for (const row of data) 
  {
    values.add(String(row[target]));
  }

  return Array.from(values);
}
function isPure(data: Row[], target: string): boolean {
  return getUniqueValues(data, target).length === 1;
}
function majorityClass(data: Row[], target: string): string {
  const counts: { [key: string]: number } = {};

  for (const row of data) 
    {
    const value = String(row[target]);

    if (counts[value] === undefined) {
      counts[value] = 1;
    } else {
      counts[value]++;
    }
  }

  let majority = "";
  let max = 0;

  for (const key in counts) 
  {
    const count = counts[key] ?? 0;

    if (count > max) 
    {
    max = count;
    majority = key;
    }
  }

  return majority;
}
function entropy(data: Row[], target: string): number {
  const counts: { [key: string]: number } = {};

  for (const row of data) {
    const value = String(row[target]);
    counts[value] = (counts[value] ?? 0) + 1;
  }

  let result = 0;

  for (const key in counts) {
    const count = counts[key] ?? 0;
    const probability = count / data.length;
    result -= probability * Math.log2(probability);
  }

  return result;
}

function splitData(
  data: Row[],
  feature: string,
  splitType: "numeric" | "categorical",
  threshold?: number,
  value?: string
): { left: Row[]; right: Row[] } {
  const left: Row[] = [];
  const right: Row[] = [];

  for (const row of data) {
    if (splitType === "numeric") {
      if (Number(row[feature]) <= Number(threshold)) {
        left.push(row);
      } else {
        right.push(row);
      }
    } else {
      if (String(row[feature]) === value) {
        left.push(row);
      } else {
        right.push(row);
      }
    }
  }

  return { left, right };
}

function informationGain(
  data: Row[],
  left: Row[],
  right: Row[],
  target: string
): number {
  const parentEntropy = entropy(data, target);

  const leftWeight = left.length / data.length;
  const rightWeight = right.length / data.length;

  const childEntropy =
    leftWeight * entropy(left, target) +
    rightWeight * entropy(right, target);

  return parentEntropy - childEntropy;
}

function bestSplit(
  data: Row[],
  features: string[],
  target: string
): {
  feature: string;
  splitType: "numeric" | "categorical";
  threshold?: number;
  value?: string;
  gain: number;
} | null {
  let best: {
    feature: string;
    splitType: "numeric" | "categorical";
    threshold?: number;
    value?: string;
    gain: number;
  } | null = null;

  for (const feature of features) {
    const firstValue = data[0]?.[feature];

    if (typeof firstValue === "number") {
      for (const row of data) {
        const threshold = Number(row[feature]);
        const { left, right } = splitData(
          data,
          feature,
          "numeric",
          threshold
        );

        if (left.length === 0 || right.length === 0) {
          continue;
        }

        const gain = informationGain(data, left, right, target);

        if (best === null || gain > best.gain) {
          best = { feature, splitType: "numeric", threshold, gain };
        }
      }
    } else {
      const values = getUniqueValues(data, feature);

      for (const value of values) {
        const { left, right } = splitData(
          data,
          feature,
          "categorical",
          undefined,
          value
        );

        if (left.length === 0 || right.length === 0) {
          continue;
        }

        const gain = informationGain(data, left, right, target);

        if (best === null || gain > best.gain) {
          best = { feature, splitType: "categorical", value, gain };
        }
      }
    }
  }

  return best;
}

export function buildTree(
  data: Row[],
  features: string[],
  target: string,
  depth: number = 0,
  maxDepth: number = 4
): TreeNode {
  if (data.length === 0) {
    return { prediction: "Unknown" };
  }

  if (isPure(data, target) || depth >= maxDepth) {
    return { prediction: majorityClass(data, target) };
  }

  const split = bestSplit(data, features, target);

  if (split === null || split.gain === 0) {
    return { prediction: majorityClass(data, target) };
  }

  const { left, right } = splitData(
  data,
  split.feature,
  split.splitType,
  split.threshold,
  split.value
);

  return {
  feature: split.feature,
  splitType: split.splitType,
  threshold: split.threshold,
  value: split.value,
  left: buildTree(left, features, target, depth + 1, maxDepth),
  right: buildTree(right, features, target, depth + 1, maxDepth),
};
}

export function predict(row: Row, tree: TreeNode): string {
  if (tree.prediction) {
    return tree.prediction;
  }

  if (!tree.feature || !tree.splitType) {
    return "Unknown";
  }

  if (tree.splitType === "numeric") {
    if (Number(row[tree.feature]) <= Number(tree.threshold)) {
      return predict(row, tree.left!);
    }

    return predict(row, tree.right!);
  }

  if (String(row[tree.feature]) === tree.value) {
    return predict(row, tree.left!);
  }

  return predict(row, tree.right!);
}