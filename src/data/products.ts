import type { Product } from "../types/product";

/** Sample affiliate catalog — replace `affiliateLink` values with your real tracking URLs. */
export const products: Product[] = [
  {
    id: 1,
    name: "Retinol Collagen",
    category: "Skincare",
    image: "../../src/images/retinol_colagin.jpg",
    description: "Retinol Collagen Serum for Anti-Aging Skin Care",
    affiliateLink: "https://amzn.to/3Og9Ik4",
    price: "₹901",
    discount: 10,
    weight: "100ml",
    mrp: "₹1001",
    featured: true,
  },
  {
    id: 2,
    name: "Radiance Serum",
    category: "Skincare",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=80",
    description:
      "Vitamin C serum for brighter, more even-looking skin over time.",
    affiliateLink: "https://example.com/affiliate/serum",
    price: "$42",
    featured: true,
  },
  {
    id: 3,
    name: "Ceramic Curling Wand",
    category: "Tools",
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=80",
    description:
      "Salon-style waves with adjustable heat and a smooth ceramic barrel.",
    affiliateLink: "https://example.com/affiliate/wand",
    price: "$68",
    featured: true,
  },
  {
    id: 4,
    name: "Hydrating Hair Mask",
    category: "Haircare",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=80",
    description:
      "Deep conditioning mask for soft, shiny hair after just one use.",
    affiliateLink: "https://example.com/affiliate/hair-mask",
    price: "$28",
    featured: true,
  },
  {
    id: 5,
    name: "Velvet Blush Duo",
    category: "Makeup",
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=80",
    description:
      "Buildable powder blush duo for a natural flush or sculpted cheek.",
    affiliateLink: "https://example.com/affiliate/blush",
    price: "$32",
  },
  {
    id: 6,
    name: "Lengthening Mascara",
    category: "Makeup",
    image:
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop&q=80",
    description:
      "Smudge-resistant formula for defined lashes without clumping.",
    affiliateLink: "https://example.com/affiliate/mascara",
    price: "$22",
  },
  {
    id: 7,
    name: "Gentle Cream Cleanser",
    category: "Skincare",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&q=80",
    description:
      "pH-balanced cleanser that removes makeup without stripping moisture.",
    affiliateLink: "https://example.com/affiliate/cleanser",
    price: "$18",
  },
  {
    id: 8,
    name: "SPF 50 Day Fluid",
    category: "Skincare",
    image:
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b14?w=600&h=600&fit=crop&q=80",
    description: "Lightweight sunscreen that sits beautifully under makeup.",
    affiliateLink: "https://example.com/affiliate/spf",
    price: "$36",
  },
  {
    id: 9,
    name: "Repairing Hair Oil",
    category: "Haircare",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=600&fit=crop&q=80",
    description:
      "Silicone-free oil blend to tame frizz and add mirror-like shine.",
    affiliateLink: "https://example.com/affiliate/hair-oil",
    price: "$26",
  },
  {
    id: 10,
    name: "Dry Shampoo Mist",
    category: "Haircare",
    image:
      "https://images.unsplash.com/photo-1527799820374-dcf8d4d4b8fe?w=600&h=600&fit=crop&q=80",
    description:
      "Absorbs oil and adds volume between washes with a fresh scent.",
    affiliateLink: "https://example.com/affiliate/dry-shampoo",
    price: "$19",
  },
  {
    id: 11,
    name: "Pro Makeup Brush Set",
    category: "Tools",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=80",
    description:
      "Soft synthetic bristles for seamless blending and precise lines.",
    affiliateLink: "https://example.com/affiliate/brushes",
    price: "$54",
  },
  {
    id: 12,
    name: "LED Vanity Mirror",
    category: "Tools",
    image:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop&q=80",
    description:
      "Adjustable lighting for flawless application at any time of day.",
    affiliateLink: "https://example.com/affiliate/mirror",
    price: "$89",
  },
];

export const CATEGORY_ORDER: Product["category"][] = [
  "Makeup",
  "Skincare",
  "Haircare",
  "Tools",
];
