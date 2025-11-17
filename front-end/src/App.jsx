import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/HomePage'
import Login from './pages/Login'
import Verify from './pages/Verify'
import Reset from './pages/Reset'
import Payment from './pages/PaymentButton'
import PaymentSuccess from './pages/PaymentSuccess'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Loader from './components/Loader'
import MyOrders from './pages/MyOrders'


const App = () => {

  setInterval(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }, 1000);

  return (
    <div className="min-h-screen w-screen bg-gray-100 overflow-x-hidden">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<Verify />} />
        <Route path="/reset-page" element={<Reset />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/paymentSuccess/:paymentId" element={<PaymentSuccess />} />
        <Route path='/my-orders' element={<MyOrders />} />
      </Routes>
    </div>
  )
}

export default App
