import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = size / 2 - 20;

  let cumulativePercentage = 0;

  const createPieSlice = (item: { value: number; color: string }, index: number) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = cumulativePercentage * 360 - 90;
    const endAngle = startAngle + angle;

    cumulativePercentage += percentage;

    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {data.map(createPieSlice)}
      </Svg>
      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>₹{item.value.toFixed(0)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  
  legend: {
    marginTop: 16,
    width: '100%',
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});