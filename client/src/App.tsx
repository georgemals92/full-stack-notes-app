// Imports
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { Toaster } from "@/components/ui/sonner";
import router from "./router/router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <>
      <Toaster />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
