import Dashboard from "@material-ui/icons/Dashboard";
import DashboardPage from "views/Dashboard/Dashboard.js";
import Board from "views/Board/Boards";
import MyProfile from "views/MyProfile/MyProfile";
import UserList from "views/Table/UserList";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: Dashboard,
    component: DashboardPage,
    layout: "/admin",
  },
  {
    path: "/board",
    name: "Board",
    icon: "content_paste",
    component: Board,
    layout: "/admin",
  },
  {
    path: "/table",
    name: "User List",
    icon: "content_paste",
    component: UserList,
    layout: "/admin",
  },
  {
    path: "/myprofile",
    name: "My Profile",
    icon: "content_paste",
    component: MyProfile,
    layout: "/admin",
  },
];

export default routes;
