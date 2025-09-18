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

  
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/customers")
      .then((res) => {
        const dataWithRisk = res.data.map((c) => ({
          ...c,
          riskScore: calculateRisk(c),
        }));
        setCustomers(dataWithRisk);
        setFetchError(null);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setFetchError("Failed to fetch customer data. Check backend server.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Risk score calculation
  const calculateRisk = (customer) => {
    const missedPayments = customer.loanRepaymentHistory.filter((x) => x === 0)
      .length;
    const creditFactor = 700 - customer.creditScore;
    const loanFactor = (customer.outstandingLoans / customer.monthlyIncome) * 10;
    const paymentFactor = missedPayments * 10;
    return Math.round(creditFactor / 7 + loanFactor + paymentFactor);
  };

  // Update Status and send alert if riskScore > 70
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/customers/${id}/status`, { status });
      
      // Update local state
      setCustomers((prev) =>
        prev.map((c) =>
          c.customerId === id ? { ...c, status } : c
        )
      );

      // Find updated customer
      const updatedCustomer = customers.find((c) => c.customerId === id);
      
      // Send alert if high risk
      if (updatedCustomer && updatedCustomer.riskScore > 70) {
        await axios.post("http://localhost:5000/alerts", {
          customerId: id,
          riskScore: updatedCustomer.riskScore,
        });
      }
    } catch (err) {
      console.error("Error updating status or sending alert:", err);
    }
  };

  // Table Columns
  const columns = [
    { title: "ID", dataIndex: "customerId" },
    { title: "Name", dataIndex: "name" },
    { title: "Credit Score", dataIndex: "creditScore" },
    {
      title: "Risk Score",
      dataIndex: "riskScore",
      render: (score) => (
        <Progress
          percent={score > 100 ? 100 : score}
          strokeColor={score > 70 ? "red" : score > 40 ? "orange" : "green"}
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
        >
          <Option value="Review">Review</Option>
          <Option value="Approved">Approved</Option>
          <Option value="Rejected">Rejected</Option>
        </Select>
      ),
    },
  ];

  const pieData = customers.map((c) => ({ name: c.name, value: c.riskScore }));
  const pieColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div style={{ padding: 20 }}>
      {loading && <Spin tip="Loading data..." size="large" />}
      {fetchError && (
        <Alert
          message="Error"
          description={fetchError}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {!loading && !fetchError && (
        <>
    
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Customers"
                  value={customers.length}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
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
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Progress
                  type="circle"
                  percent={
                    customers.length > 0
                      ? Math.round(
                          (customers.filter((c) => c.status === "Approved").length /
                            customers.length) *
                            100
                        )
                      : 0
                  }
                />
                <p style={{ textAlign: "center", marginTop: 10 }}>Approval Rate</p>
              </Card>
            </Col>
          </Row>

          
          <Card title="Customer Data" style={{ marginBottom: 20 }}>
            <Table dataSource={customers} columns={columns} rowKey="customerId" />
          </Card>

        
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Income vs Expenses">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={customers}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="monthlyIncome" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="monthlyExpenses" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Risk Score Distribution">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;
