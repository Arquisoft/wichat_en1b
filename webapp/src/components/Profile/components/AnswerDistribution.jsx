import { Typography, Box, Card, CardContent, Divider } from "@mui/material";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend
} from "recharts";
import { CHART_COLORS } from "../theme";

const AnswerDistribution = ({ chartData }) => {
  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Answer Distribution</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS[1] : CHART_COLORS[3]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnswerDistribution;