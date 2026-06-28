import type { Metadata } from "next";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import "./globals.css";

export const metadata: Metadata = { title: "Golding AI Operating System", description: "Production foundation for the Golding AI Operating System." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeStyle = {
    "--color-executive-emerald": colors.executiveEmerald,
    "--color-heritage-green": colors.heritageGreen,
    "--color-forest-shadow": colors.forestShadow,
    "--color-executive-gold": colors.executiveGold,
    "--color-rich-gold": colors.richGold,
    "--color-champagne-gold": colors.champagneGold,
    "--color-ivory": colors.ivory,
    "--color-midnight": colors.midnight,
    "--font-sans": typography.fontSans,
    "--font-hero": typography.hero,
    "--font-h1": typography.h1,
    "--font-h2": typography.h2,
    "--space-sm": spacing.sm,
    "--space-md": spacing.md,
    "--space-lg": spacing.lg,
    "--space-xl": spacing.xl,
    "--radius-md": radius.md,
    "--radius-lg": radius.lg,
    "--radius-xl": radius.xl,
    "--radius-pill": radius.pill,
    "--shadow-executive": shadows.executive,
    "--shadow-card": shadows.card,
    "--shadow-focus": shadows.focus,
  } as React.CSSProperties;

  return <html lang="en"><body style={themeStyle}>{children}</body></html>;
}
