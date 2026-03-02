import type { ProductConfig } from "@/lib/schemas";

export const MOCK_TSHIRT: ProductConfig = {
  id: "tshirt-sporty-001",
  slug: "sporty-t-shirt",
  name: "Men's Sporty T-Shirt",
  model_url: "/3d/Men-Regular-Apparel-Fit-Sporty-T-Shirt/Men Sporty T-Shirt.glb",
  zones: [
    {
      id: "front_text",
      name: "Front Text",
      type: "text",
      uv: { x: 680, y: 450, width: 700, height: 200 },
      constraints: {
        max_characters: 20,
        font_options: ["inter", "bebas-neue", "oswald", "roboto-condensed"],
      },
      defaults: {
        font: "Inter",
        fontSize: 64,
        fill: "#FFFFFF",
      },
    },
    {
      id: "back_name",
      name: "Back Name",
      type: "text",
      uv: { x: 680, y: 1300, width: 700, height: 150 },
      constraints: {
        max_characters: 15,
        font_options: ["inter", "bebas-neue", "oswald", "roboto-condensed"],
      },
      defaults: {
        font: "Inter",
        fontSize: 56,
        fill: "#FFFFFF",
      },
    },
    {
      id: "back_number",
      name: "Back Number",
      type: "number",
      uv: { x: 800, y: 1480, width: 450, height: 350 },
      constraints: {
        max_characters: 2,
        min_value: 0,
        max_value: 99,
      },
      defaults: {
        font: "Bebas Neue",
        fontSize: 180,
        fill: "#FFFFFF",
      },
    },
    {
      id: "sleeve_logo",
      name: "Sleeve Logo",
      type: "image",
      uv: { x: 150, y: 500, width: 250, height: 250 },
      constraints: {
        max_width: 512,
        max_height: 512,
        allowed_formats: ["png", "jpg", "jpeg", "webp", "svg"],
      },
    },
  ],
  colors: [
    { id: "navy", name: "Navy Blue", hex: "#1B2A4A" },
    { id: "black", name: "Black", hex: "#111111" },
    { id: "white", name: "White", hex: "#F5F5F5" },
    { id: "red", name: "Racing Red", hex: "#C41E3A" },
    { id: "forest", name: "Forest Green", hex: "#1B4332" },
    { id: "royal", name: "Royal Blue", hex: "#1A5276" },
    { id: "charcoal", name: "Charcoal", hex: "#36454F" },
    { id: "burgundy", name: "Burgundy", hex: "#722F37" },
    { id: "teal", name: "Teal", hex: "#008080" },
    { id: "slate", name: "Slate Grey", hex: "#708090" },
  ],
  fonts: [
    { id: "inter", name: "Inter", family: "Inter" },
    { id: "bebas-neue", name: "Bebas Neue", family: "Bebas Neue" },
    { id: "oswald", name: "Oswald", family: "Oswald" },
    {
      id: "roboto-condensed",
      name: "Roboto Condensed",
      family: "Roboto Condensed",
    },
  ],
};

export function getMockProduct(_id: string): ProductConfig {
  return MOCK_TSHIRT;
}
