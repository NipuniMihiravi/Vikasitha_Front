import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Home/Layout";
import Dashboard from "./Home/Dashboard";
import Registration from "./Home/Registration";
import Bill from "./Home/Bill";
import TariffForm from "./Home/TariffForm";
import Reports from "./Home/Reports";
import PaymentForm from "./Home/PaymentForm";
import BillingTable from "./Home/BillingTable";
import ManageBilling from "./Home/ManageBilling";
import PaymentTable from "./Home/PaymentTable";
import ManagePayment from "./Home/ManagePayment";
import TransactionTable from "./Home/TransactionTable";
import MemberDetails from "./Home/MemberDetails";
import GenerateBill from "./Home/GenerateBill";

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wraps all pages with sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* Default page */}
          <Route path="registration" element={<Registration />} />
          <Route path="bill" element={<Bill />} />
          <Route path="payment" element={<PaymentForm />} />

           <Route path="/reports/billingdetails" element={<BillingTable />} />
            <Route path="/reports/managebilling" element={<ManageBilling />} />
            <Route path="/reports/memberdetails" element={<MemberDetails />} />

          <Route path="reports" element={<Reports />} />
          <Route path="/reports/tariff" element={<TariffForm />} />
          <Route path="/reports/payment" element={<PaymentTable />} />
          <Route path="/reports/managepayment" element={<ManagePayment />} />
           <Route path="/reports/access" element={<TransactionTable />} />

          <Route path="/reports/member" element={<GenerateBill />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
