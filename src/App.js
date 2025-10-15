import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Home/Layout";
import Dashboard from "./Home/Dashboard";
import Registration from "./Home/Registration";
import Bill from "./Home/Bill";
import TariffForm from "./Home/TariffForm";
import Manage from "./Home/Manage";
import Report from "./Home/Report";
import Expenses from "./Home/Expenses";
import PaymentForm from "./Home/PaymentForm";
import BillingTable from "./Home/BillingTable";
import ManageBilling from "./Home/ManageBilling";
import PaymentTable from "./Home/PaymentTable";
import ManagePayment from "./Home/ManagePayment";
import TransactionTable from "./Home/TransactionTable";
import MemberDetails from "./Home/MemberDetails";
import GenerateBill from "./Home/GenerateBill";
import Login from "./Home/Login";
import MaintenanceForm from "./Home/MaintenanceForm";
import MaintenancePayment from "./Home/MaintenancePayment";
import PaymentMaintenence from "./Home/PaymentMaintenence";
import ExpensesForm from "./Home/ExpensesForm";
import FinanceSummary from "./Home/FinanceSummary";
import MemberLedger from "./Home/MemberLedger";
import MobileDash from "./Home/MobileDash";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Mobile Dashboard (no Layout) */}
        <Route path="/mobiledash" element={<MobileDash />} />

        {/* Protected Routes under Layout */}
        <Route path="/main" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="registration" element={<Registration />} />
          <Route path="bill" element={<Bill />} />
          <Route path="payment" element={<PaymentForm />} />
          <Route path="maintenance" element={<PaymentMaintenence />} />
          <Route path="expences-entering" element={<ExpensesForm />} />
          <Route path="access" element={<TransactionTable />} />

          {/* Reports */}
          <Route path="manage" element={<Manage />} />
          <Route path="manage/billingdetails" element={<BillingTable />} />
          <Route path="manage/managebilling" element={<ManageBilling />} />
          <Route path="manage/memberdetails" element={<MemberDetails />} />
          <Route path="manage/tariff" element={<TariffForm />} />
          <Route path="manage/managepayment" element={<ManagePayment />} />
          <Route path="manage/member" element={<GenerateBill />} />
          <Route path="manage/maintenance" element={<MaintenanceForm />} />
          <Route path="manage/maintenancepayment" element={<MaintenancePayment />} />
          <Route path="manage/expenses" element={<Expenses />} />

          <Route path="report" element={<Report />} />
          <Route path="report/billingdetails" element={<BillingTable />} />
          <Route path="report/payment" element={<PaymentTable />} />
          <Route path="report/summery" element={<FinanceSummary />} />
          <Route path="report/memberledger" element={<MemberLedger />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
