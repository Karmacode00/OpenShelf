const PRIMARY = '#024059';
const SECONDARY = '#037F8C';
const ACCENT = '#75B8BF';
const TEXT = '#1E1E1E';
const ICON_MUTED = '#5D7378';
const BORDER = '#D9E7E9';
const BACKGROUND = '#F2F2F2';
const TEXT_CONTRAST = '#FFFFFF';

export const Colors = {
  light: {
    text: TEXT,
    textContrast: TEXT_CONTRAST,
    textDark: PRIMARY,
    title: SECONDARY,
    background: '#FFFFFF',
    tint: ACCENT,
    icon: ICON_MUTED,
    tabIconDefault: ICON_MUTED,
    tabIconSelected: PRIMARY,

    accent: ACCENT,
    card: PRIMARY,
    surface: '#F6FBFC',
    border: BORDER,
    buttonPrimary: ACCENT,
    buttonPrimaryText: TEXT_CONTRAST,
    buttonSecondary: PRIMARY,
    buttonSecondaryText: TEXT_CONTRAST,
    inputBg: BACKGROUND,
    inputText: PRIMARY,
    chipBg: '#E9F6F7',
    chipText: PRIMARY,
  },

  dark: {
    text: '#E6F1F2',
    textContrast: TEXT_CONTRAST,
    textDark: PRIMARY,
    title: SECONDARY,
    background: '#0B1A1C',
    tint: ACCENT,
    icon: '#88A7AC',
    tabIconDefault: '#88A7AC',
    tabIconSelected: ACCENT,

    accent: ACCENT,
    card: '#092B30',
    surface: '#0F2428',
    border: '#14383E',
    buttonPrimary: ACCENT,
    buttonPrimaryText: '#0B1A1C',
    buttonSecondary: '#0E3A41',
    buttonSecondaryText: '#E6F1F2',
    inputBg: '#0E3A41',
    inputText: '#E6F1F2',
    chipBg: '#123238',
    chipText: ACCENT,
  },
};
