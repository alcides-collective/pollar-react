#!/bin/bash
# Dark mode EDGE CASE audit
# Catches things the main audit misses
# Usage: bash scripts/audit-dark-mode-edges.sh

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

SRC="src/"
EXT="*.tsx"

echo -e "${CYAN}=== Dark Mode Edge Case Audit ===${NC}"
echo ""

# ---------------------------------------------------------------------------
# 1. text-zinc-* without dark: (main audit only checks bg-zinc)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[1] text-zinc-* without dark: variant:${NC}"
grep -rn 'text-zinc-' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  | grep -v '// ' \
  | grep -v 'text-zinc-100\|text-zinc-200\|text-zinc-300\|text-zinc-400' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 2. border-zinc-* without dark: (excluding overlays)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[2] border-zinc-* without dark: variant:${NC}"
grep -rn 'border-zinc-' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  | grep -v 'border-zinc-700\|border-zinc-800\|border-zinc-900' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 3. divide-zinc-* / ring-zinc-* / outline-zinc-* without dark:
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[3] divide/ring/outline-zinc-* without dark:${NC}"
grep -rn '\(divide-zinc-\|ring-zinc-\|outline-zinc-\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 4. Gradient stops (from-/to-/via-) with light colors without dark:
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[4] Gradient stops (from/to/via) with zinc-50..200 or white, without dark:${NC}"
grep -rn '\(from-\|to-\|via-\)\(white\|zinc-50\|zinc-100\|zinc-200\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 5. Gradient stops with colored light shades (e.g. from-blue-50)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[5] Gradient stops from/to/via-{color}-50/100 without dark:${NC}"
grep -rn '\(from-\|to-\|via-\)\(blue\|green\|red\|amber\|yellow\|purple\|pink\|orange\|cyan\|emerald\|violet\|indigo\)-\(50\|100\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 6. Inline style={{ with hardcoded color/background values
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[6] Inline style= with hardcoded color/backgroundColor:${NC}"
grep -rn 'style={{' $SRC --include="$EXT" \
  | grep -i '\(color:\|background\|borderColor\)' \
  | grep -v 'width\|height\|transform\|transition\|opacity\|display\|position\|overflow\|zIndex\|flex\|grid\|gap\|padding\|margin' \
  | grep '#\|rgb\|hsl' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 7. Hardcoded hex colors in className (e.g. text-[#xxx], bg-[#xxx])
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[7] Hardcoded hex in className (text-[#...], bg-[#...], border-[#...]):${NC}"
grep -rn '\(text-\[#\|bg-\[#\|border-\[#\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 8. shadow-* with color that might look wrong in dark mode
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[8] Colored shadows (shadow-{color}) without dark:${NC}"
grep -rn 'shadow-\(blue\|green\|red\|amber\|purple\|pink\|orange\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 9. placeholder-{color} without dark:
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[9] placeholder-zinc/color without dark:${NC}"
grep -rn 'placeholder-\(zinc\|gray\|slate\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 10. hover:bg-white or hover:bg-zinc-50/100 without dark:hover:
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[10] hover:bg-white / hover:bg-zinc-50..100 without dark:hover:${NC}"
grep -rn 'hover:bg-\(white\|zinc-50\|zinc-100\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 11. hover:text-zinc-* (light-hostile shades) without dark:hover:
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[11] hover:text-zinc-600..900 without dark:hover:${NC}"
grep -rn 'hover:text-zinc-\(600\|700\|800\|900\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 12. hover:border-zinc-* (light-only) without dark:hover:
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[12] hover:border-zinc-100..300 without dark:hover:${NC}"
grep -rn 'hover:border-zinc-\(100\|200\|300\)' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 13. focus:ring-{color}-* without dark:focus: (accessibility outlines)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[13] focus:ring-{color} without dark:focus: (non-generic):${NC}"
grep -rn 'focus:ring-\(blue\|green\|red\|amber\|zinc\)-' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  | grep -v 'focus:ring-ring\|focus:ring-offset' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 14. text-black without dark: (not inside Header/Footer dark sections)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[14] text-black without dark: variant:${NC}"
grep -rn ' text-black' $SRC --include="$EXT" \
  | grep -v 'dark:' \
  | grep -v 'Header\|Footer' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 15. bg-white in SVG or img wrapper (may indicate card that needs dark bg)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[15] bg-white near img/svg/avatar (potential card bg):${NC}"
grep -rn 'bg-white' $SRC --include="$EXT" \
  | grep -i '\(img\|svg\|avatar\|photo\|logo\|icon\)' \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 16. Conditional classes with ternary that only handle light mode
#     Pattern: condition ? 'bg-something' : 'bg-something' (no dark: in either)
#     Only check for bg-{color}-50..200 patterns
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[16] Ternary class with bg-{color}-50..200 missing dark: in BOTH branches:${NC}"
grep -rn "? '" $SRC --include="$EXT" \
  | grep 'bg-\(blue\|green\|red\|amber\|yellow\|purple\|pink\|orange\)-\(50\|100\|200\)' \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 17. CSS files: hardcoded colors that aren't using variables
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[17] CSS files with hardcoded hex/rgb (not var(--)):${NC}"
grep -rn '#[0-9a-fA-F]\{3,8\}\b' $SRC --include="*.css" \
  | grep -v 'var(--' \
  | grep -v '@theme\|@layer\|oklch\|:root\|\.dark' \
  | grep -v '\.summary-content\|\.quote-box\|\.timeline-box\|\.fact-check-box\|\.comparison-box\|\.analysis-box\|\.key-point\|\.stat-box\|\.proscons-box' \
  | head -20 \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 18. select/input/textarea without bg-background or bg-surface (form fields)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[18] <select> or <input> with border but no explicit bg (inherits white):${NC}"
grep -rn '<select\|<input' $SRC --include="$EXT" \
  | grep 'border' \
  | grep -v 'bg-\|type="checkbox"\|type="radio"\|type="hidden"\|type="file"' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 19. Images with bg-white backgrounds (might need dark variant for loading)
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[19] img/EventImage with explicit white/zinc-50 bg:${NC}"
grep -rn '<img\|EventImage\|<Image' $SRC --include="$EXT" -A2 \
  | grep 'bg-white\|bg-zinc-50' \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# 20. Skeleton/loading states that might look wrong
# ---------------------------------------------------------------------------
echo -e "${YELLOW}[20] animate-pulse / skeleton with light-only bg:${NC}"
grep -rn 'animate-pulse\|animate-skeleton\|Skeleton' $SRC --include="$EXT" \
  | grep 'bg-\(zinc\|gray\|white\)-\|bg-white' \
  | grep -v 'dark:' \
  || echo -e "${GREEN}  Clean!${NC}"
echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo -e "${CYAN}=== Summary Counts ===${NC}"

echo -n "  text-zinc-500..900 (no dark:): "
grep -rc 'text-zinc-\(500\|600\|700\|800\|900\)' $SRC --include="$EXT" \
  | awk -F: '{s+=$2} END {print s+0}'

echo -n "  border-zinc-100..600 (no dark:): "
grep -rc 'border-zinc-\(100\|200\|300\|400\|500\|600\)' $SRC --include="$EXT" \
  | awk -F: '{s+=$2} END {print s+0}'

echo -n "  Hardcoded hex in classes: "
grep -rc '\(text-\[#\|bg-\[#\|border-\[#\)' $SRC --include="$EXT" \
  | awk -F: '{s+=$2} END {print s+0}'

echo -n "  Inline style with color: "
grep -rc 'style={{' $SRC --include="$EXT" \
  | awk -F: '{s+=$2} END {print s+0}'

echo ""
echo -e "${GREEN}Done.${NC}"
