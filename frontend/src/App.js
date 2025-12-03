import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#4a5568",
      light: "#718096",
      dark: "#2d3748",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#718096",
      light: "#a0aec0",
      dark: "#4a5568",
    },
    background: {
      default: "#f7fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a202c",
      secondary: "#718096",
    },
    divider: "#e2e8f0",
    grey: {
      50: "#f7fafc",
      100: "#edf2f7",
      200: "#e2e8f0",
      300: "#cbd5e0",
      400: "#a0aec0",
      500: "#718096",
      600: "#4a5568",
      700: "#2d3748",
      800: "#1a202c",
      900: "#171923",
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
      color: "#1a202c",
    },
    h5: {
      fontWeight: 600,
      color: "#1a202c",
    },
    h6: {
      fontWeight: 600,
      color: "#1a202c",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          textTransform: "none",
          fontWeight: 500,
          "&:hover": {
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        },
        outlined: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation2: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardWarning: {
          backgroundColor: "#fef3c7",
          color: "#78350f",
          border: "1px solid #fde68a",
          "& .MuiAlert-icon": {
            color: "#d97706",
          },
        },
        standardInfo: {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
          border: "1px solid #bfdbfe",
          "& .MuiAlert-icon": {
            color: "#3b82f6",
          },
        },
        standardSuccess: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          border: "1px solid #a7f3d0",
          "& .MuiAlert-icon": {
            color: "#10b981",
          },
        },
        standardError: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
          "& .MuiAlert-icon": {
            color: "#ef4444",
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
}

export default App;