import { Text as DefaultText, View as DefaultView } from 'react-native';
import { useTheme } from '@react-navigation/native';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ReturnType<typeof useTheme>['colors']
) {
  const { colors } = useTheme();
  const colorFromProps = props[colorName === 'text' ? 'light' : 'dark'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();
  const color = colors.text;

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();
  const backgroundColor = colors.background;

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
} 