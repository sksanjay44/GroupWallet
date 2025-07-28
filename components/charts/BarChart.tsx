import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <View style={[styles.chart, { height }]}>
            {data.map((item, index) => {
              const barHeight = (item.value / maxValue) * (height - 40);
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <Text style={styles.barValue}>₹{item.value.toFixed(0)}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: Colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  
  chartContainer: {
    paddingHorizontal: 16,
  },
  
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 24,
  },
  
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 60,
  },
  
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  
  bar: {
    width: 24,
    borderRadius: 4,
    marginTop: 4,
  },
  
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  
  barLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});