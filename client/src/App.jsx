import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AdviceSection from "./components/AdviceSection";
import RegisterPage from "./components/RegisterPage";
import AddProductForm from "./components/AddProductForm";
import ProductList from "./components/ProductList";
import Home from "./components/Home";
import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import ResetPasswordPage from "./components/ResetPasswordPage";
import RecommendedProducts from "./components/RecommendedProducts";
import CheckoutPage from "./components/CheckoutPage";
import NewPasswordPage from "./components/NewPasswordPage";
import WishlistPage from "./components/WishlistPage";
import Footer from "./components/FooterComponent";
import OrderSuccess from "./components/OrderSucces";
import OrdersPage from "./components/OrdersPage";

const App = () => {
  const token = localStorage.getItem("token");

  let userId = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken?.user?.id;
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:token" element={<NewPasswordPage />} />
        <Route path="/add-product" element={<AddProductForm />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route
          path="/wishlist"
          element={
            <>
              <Header /> <WishlistPage />
            </>
          }
        />
        <Route path="/products" element={<ProductList />} />
        <Route
          path="/checkout"
          element={
            <>
              <Header /> <CheckoutPage />
            </>
          }
        />
        <Route
          path="/home"
          element={
            <>
              <Header />
              <Home />
              {userId && <RecommendedProducts userId={userId} />}
              <Footer />
            </>
          }
        />
        <Route
          path="/consiliere"
          element={
            <>
              <Header />
              <AdviceSection />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
