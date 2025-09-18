import React from "react";
import Dashboard from "./Dashboard";
import { Layout } from "antd";

const { Header, Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ color: "white", fontSize: "20px" }}>
        Credit Risk Analytics Dashboard
      </Header>
      <Content style={{ padding: "20px" }}>
        <Dashboard />
      </Content>
    </Layout>
  );
}

export default App;
