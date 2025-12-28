import AuthPage from "@/pages/AuthPage";
import NotesPage from "@/pages/NotesPage";
import Root from "@/Root";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import RouteRequiresAuth from "./RouteRequiresAuth";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route path="login" element={<AuthPage mode="login" />}></Route>
      <Route path="register" element={<AuthPage mode="register" />}></Route>
      <Route path="notes" element={<RouteRequiresAuth><NotesPage /></RouteRequiresAuth>}></Route>
    </Route>
  )
);

export default router;
