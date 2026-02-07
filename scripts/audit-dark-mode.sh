#!/bin/bash
# Dark mode audit script
# Finds hardcoded bg/text/border colors that might need dark: variants
# Usage: bash scripts/audit-dark-mode.sh

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}=== Dark Mode Audit ===${NC}"
echo ""

# 1. Hardcoded bg-white without dark: variant
echo -e "${YELLOW}[1] bg-white (without dark: on same line):${NC}"
grep -rn ' bg-white' src/ --include="*.tsx" | grep -v 'dark:' | grep -v 'bg-white/' | grep -v 'bg-white/9' | grep -v 'hover:bg-white' || echo -e "${GREEN}  Clean!${NC}"
echo ""

# 2. bg-zinc-* without dark: (excluding overlays like bg-zinc-900/70)
echo -e "${YELLOW}[2] bg-zinc-* (without dark:, excluding overlays):${NC}"
grep -rn ' bg-zinc-' src/ --include="*.tsx" | grep -v 'dark:' | grep -v 'bg-zinc-900/7' | grep -v 'bg-zinc-800/8' || echo -e "${GREEN}  Clean!${NC}"
echo ""

# 3. bg-gray/slate/neutral/stone (shouldn't exist in this codebase)
echo -e "${YELLOW}[3] bg-gray/slate/neutral/stone (non-zinc gray scales):${NC}"
grep -rn ' bg-gray-\| bg-slate-\| bg-neutral-\| bg-stone-' src/ --include="*.tsx" || echo -e "${GREEN}  Clean!${NC}"
echo ""

# 4. Light-only colored backgrounds (bg-*-50, bg-*-100) without dark:
echo -e "${YELLOW}[4] bg-{color}-50 or bg-{color}-100 without dark: variant:${NC}"
grep -rn 'bg-\(blue\|green\|red\|amber\|yellow\|purple\|pink\|orange\|cyan\|emerald\|violet\|indigo\)-\(50\|100\)' src/ --include="*.tsx" | grep -v 'dark:' || echo -e "${GREEN}  Clean!${NC}"
echo ""

# 5. border-{color}-200 without dark: (light-only borders)
echo -e "${YELLOW}[5] border-{color}-200 without dark: variant:${NC}"
grep -rn 'border-\(blue\|green\|red\|amber\|yellow\|purple\)-200' src/ --include="*.tsx" | grep -v 'dark:' || echo -e "${GREEN}  Clean!${NC}"
echo ""

# 6. text-{color}-600/700/800/900 without dark: (may be too dark in dark mode)
echo -e "${YELLOW}[6] text-{color}-600+ without dark: (potentially too dark):${NC}"
grep -rn 'text-\(blue\|green\|red\|amber\)-\(700\|800\|900\)' src/ --include="*.tsx" | grep -v 'dark:' || echo -e "${GREEN}  Clean!${NC}"
echo ""

# 7. Summary counts
echo -e "${CYAN}=== Summary ===${NC}"
echo -n "  bg-white (no dark:): "
grep -rc ' bg-white' src/ --include="*.tsx" | awk -F: '{s+=$2} END {print s}' | grep -v '^0$' || echo "0"
echo -n "  bg-zinc-* (no dark:): "
grep -rc ' bg-zinc-' src/ --include="*.tsx" | awk -F: '{s+=$2} END {print s}' | grep -v '^0$' || echo "0"
echo -n "  Files with any zinc: "
grep -rl 'zinc' src/ --include="*.tsx" | wc -l | tr -d ' '
echo ""
echo -e "${GREEN}Done.${NC}"
