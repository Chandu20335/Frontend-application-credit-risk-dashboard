import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Row,
  Col,
  Statistic,
  Progress,
  Spin,
  Alert,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const { Option } = Select;

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const apiUrl = "http://localhost:5000";

  // Fetch customers and calculate risk scores from backend
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiUrl}/customers`)
      .then((res) => {
        setCustomers(res.data);
        setFetchError(null);
      })
      .catch(() => {
        setFetchError(
          "Customer data fetch karne mein failure. Kripya backend server (port 5000) check karein."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Update customer status and update UI + send alert if needed
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${apiUrl}/customers/${id}/status`, { status });

      setCustomers((prev) =>
        prev.map((c) => (c.customerId === id ? { ...c, status } : c))
      );

      const updatedCustomer = customers.find((c) => c.customerId === id);

      if (updatedCustomer && updatedCustomer.riskScore > 70) {
        await axios.post(`${apiUrl}/alerts`, {
          customerId: id,
          riskScore: updatedCustomer.riskScore,
        });
      }
    } catch (err) {
      console.error("Status update ya alert send karne mein error:", err);
    }
  };

  // Columns for AntD table
  const columns = [
    { title: "ID", dataIndex: "customerId", responsive: ["lg"] },
    { title: "Name", dataIndex: "name" },
    {
      title: "Credit Score",
      dataIndex: "creditScore",
      sorter: (a, b) => a.creditScore - b.creditScore,
    },
    {
      title: "Risk Score",
      dataIndex: "riskScore",
      sorter: (a, b) => a.riskScore - b.riskScore,
      render: (score) => (
        <Progress
          percent={score > 100 ? 100 : score}
          strokeColor={
            score > 70 ? "#ff4d4f" : score > 40 ? "#faad14" : "#52c41a"
          }
          size="small"
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text, record) => (
        <Select
          value={text}
          onChange={(val) => updateStatus(record.customerId, val)}
          style={{ width: 120 }}
          disabled={loading}
        >
          <Option value="Review">Review</Option>
          <Option value="Approved">Approved</Option>
          <Option value="Rejected">Rejected</Option>
        </Select>
      ),
    },
  ];

  // Data for pie chart: status distribution
  const statusData = [
    { name: "Approved", value: customers.filter((c) => c.status === "Approved").length },
    { name: "Review", value: customers.filter((c) => c.status === "Review").length },
    { name: "Rejected", value: customers.filter((c) => c.status === "Rejected").length },
  ].filter((item) => item.value > 0);

  const statusColors = ["#52c41a", "#1890ff", "#ff4d4f"];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Financial Risk Dashboard
        </h1>

        {loading && (
          <Spin
            tip="Data load ho raha hai..."
            size="large"
            className="block text-center py-12"
          />
        )}

        {fetchError && (
          <Alert
            message="Connection Error"
            description={fetchError}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 20 }}
          />
        )}

        {!loading && !fetchError && (
          <>
            {/* Summary cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-lg rounded-xl">
                  <Statistic
                    title="Total Customers"
                    value={customers.length}
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-lg rounded-xl">
                  <Statistic
                    title="Avg Credit Score"
                    value={
                      customers.length > 0
                        ? Math.round(
                            customers.reduce((a, c) => a + c.creditScore, 0) /
                              customers.length
                          )
                        : 0
                    }
                    suffix="/ 850"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-lg rounded-xl">
                  <Statistic
                    title="High Risk (>70 Score)"
                    value={customers.filter((c) => c.riskScore > 70).length}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-lg rounded-xl text-center">
                  <Progress
                    type="circle"
                    percent={
                      customers.length > 0
                        ? Math.round(
                            (customers.filter((c) => c.status === "Approved")
                              .length /
                              customers.length) *
                              100
                          )
                        : 0
                    }
                    width={80}
                    strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                  />
                  <p className="mt-4 font-semibold text-gray-600">
                    Approval Rate
                  </p>
                </Card>
              </Col>
            </Row>

            {/* Customer Table */}
            <Card
              title="Customer Data & Risk Assessment"
              className="shadow-lg rounded-xl"
              style={{ marginBottom: 24 }}
              bodyStyle={{ overflowX: "auto" }}
            >
              <Table
                dataSource={customers}
                columns={columns}
                rowKey="customerId"
                pagination={{ pageSize: 5 }}
              />
            </Card>

            {/* Charts */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Income vs Expenses Analysis" className="shadow-lg rounded-xl">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      data={customers}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, "Monthly Amount"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="monthlyIncome"
                        stroke="#52c41a"
                        activeDot={{ r: 8 }}
                        name="Income"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="monthlyExpenses"
                        stroke="#fadb14"
                        name="Expenses"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Customer Status Distribution" className="shadow-lg rounded-xl">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        fill="#8884d8"
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={statusColors[index % statusColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} Customers`, name]}
                      />
                      <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
