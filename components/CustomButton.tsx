import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Animated, TextStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/Theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
}: CustomButtonProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const getButtonStyle = () => {
    const buttonStyles: any[] = [styles.button];
    
    // Add size styles
    if (size === 'small') buttonStyles.push(styles.small);
    if (size === 'medium') buttonStyles.push(styles.medium);
    if (size === 'large') buttonStyles.push(styles.large);
    
    // Add variant styles
    if (variant === 'primary') buttonStyles.push(styles.primary);
    if (variant === 'secondary') buttonStyles.push(styles.secondary);
    if (variant === 'outline') buttonStyles.push(styles.outline);
    if (variant === 'gradient') buttonStyles.push(styles.gradient);
    
    // Add state styles
    if (disabled || loading) buttonStyles.push(styles.disabled);
    
    // Add custom style
    if (style) buttonStyles.push(style);
    
    return buttonStyles;
  };

  const getTextStyle = () => {
    const textStyles: any[] = [styles.text];
    
    // Add size text styles
    if (size === 'small') textStyles.push(styles.smallText);
    if (size === 'medium') textStyles.push(styles.mediumText);
    if (size === 'large') textStyles.push(styles.largeText);
    
    // Add variant text styles
    if (variant === 'primary' || variant === 'gradient') {
      textStyles.push(styles.primaryText);
    } else if (variant === 'secondary') {
      textStyles.push(styles.secondaryText);
    } else if (variant === 'outline') {
      textStyles.push(styles.outlineText);
    }
    
    // Add disabled text style
    if (disabled || loading) textStyles.push(styles.disabledText);
    
    return textStyles;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {icon && <>{icon}</>}
        <ThemedText style={getTextStyle()}>
          {loading ? 'Loading...' : title}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadow.md,
  },
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minHeight: 40,
  },
  medium: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 48,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    minHeight: 56,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  gradient: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  disabled: {
    backgroundColor: Colors.backgroundTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: FontSize.sm,
  },
  mediumText: {
    fontSize: FontSize.base,
  },
  largeText: {
    fontSize: FontSize.lg,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.textTertiary,
  },
});
