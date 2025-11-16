import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Users from "./pages/Users";
import Products from "./pages/Products";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Borrowings from "./pages/Borrowings";
import AddBorrowing from "./pages/AddBorrowing";
import BorrowingHistory from "./pages/BorrowingHistory";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/users" element={<Users/>} />
          <Route path="/users/add" element={<AddUser/>} />
          <Route path="/users/edit/:id" element={<EditUser/>} />
          <Route path="/products" element={<Products/>} />
          <Route path="/products/add" element={<AddProduct/>} />
          <Route path="/products/edit/:id" element={<EditProduct/>} />
          <Route path="/products/detail/:id" element={<ProductDetail/>} />
          <Route path="/borrowings" element={<Borrowings/>} />
          <Route path="/borrowings/add" element={<AddBorrowing/>} />
          <Route path="/borrowings/history" element={<BorrowingHistory/>} />
          <Route path="/categories" element={<Categories/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;