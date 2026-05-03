export const colorMap: Record<string, string> = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Red": "#EF4444",
  "Green": "#10B981",
  "Blue": "#3B82F6",
  "Navy": "#1E3A8A",
  "Grey": "#6B7280",
  "Gray": "#6B7280",
  "Yellow": "#F59E0B",
  "Orange": "#FB923C",
  "Pink": "#EC4899",
  "Purple": "#8B5CF6",
  "Brown": "#78350F",
  "Beige": "#F5F5DC",
  "Cream": "#FFFDD0",
  "Khaki": "#C3B091",
  "Olive": "#808000",
  "Light Blue": "#ADD8E6",
  "Tan": "#D2B48C",
  "Midnight Blue": "#191970",
};

export const getColorHex = (colorName?: string): string => {
  if (!colorName) return "#ccc"; // fallback color

  const findColor = (name: string) => {
    if (colorMap[name]) return colorMap[name];
    const titleCase = name
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    if (colorMap[titleCase]) return colorMap[titleCase];
    return name;
  };

  if (colorName.includes("/")) {
    const parts = colorName.split("/");
    const color1 = findColor(parts[0]);
    const color2 = findColor(parts[1]);

    return `repeating-linear-gradient(
      45deg,
      ${color1},
      ${color1} 6px,
      ${color2} 6px,
      ${color2} 12px
    )`;
  }

  return findColor(colorName);
};