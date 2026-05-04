import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

/**
 * A visually appealing Pie Chart for MOA status or similar metrics.
 */
export function OasisPieChart({ items = [] }) {
    // Filter out items with no value to prevent chart errors
    const data = items.filter(item => item.value > 0);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 italic">
                No data available for chart
            </div>
        );
    }

    return (
        <div className="w-full h-[350px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="label"
                        animationDuration={1500}
                        animationBegin={200}
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color || '#8884d8'} 
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }} 
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

/**
 * A Bar Chart for comparing general metrics (Students, HTEs, etc.)
 */
export function OasisBarChart({ data = [] }) {
    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <Tooltip 
                        cursor={{ fill: '#f5f5f5' }}
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }} 
                    />
                    <Bar 
                        dataKey="value" 
                        radius={[6, 6, 0, 0]} 
                        barSize={40}
                        animationDuration={1500}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#2B6259'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
