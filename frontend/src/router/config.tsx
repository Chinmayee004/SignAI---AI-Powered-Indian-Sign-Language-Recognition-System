import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import LiveRecognition from "../pages/live/page";
import UploadTest from "../pages/upload/page";
import History from "../pages/history/page";
import Insights from "../pages/insights/page";
import About from "../pages/about/page";

const routes: RouteObject[] = [
  { path: "/",             element: <Home /> },
  { path: "/live",         element: <LiveRecognition /> },
  { path: "/upload",       element: <UploadTest /> },
  { path: "/history",      element: <History /> },
  { path: "/insights",     element: <Insights /> },
  { path: "/about",        element: <About /> },
  { path: "*",             element: <NotFound /> },
];

export default routes;
