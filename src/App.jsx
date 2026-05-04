import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/layout/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import Home from './pages/Home.jsx';
import Checkout from './pages/Checkout.jsx';
import AdminAlunos from './pages/admin/Alunos.jsx';

function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/alunos" element={<AdminAlunos />} />
      </Routes>
    </Router>
  );
}

export default App;
