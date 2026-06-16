import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home";
import { Farmers } from "./pages/Farmers";
import { FarmerStory } from "./pages/FarmerStory";
import { Report } from "./pages/Report";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "farmers", element: <Farmers /> },
      { path: "farmers/:id", element: <FarmerStory /> },
      { path: "report", element: <Report /> },
    ],
  },
]);
