import Dashboard from "@material-ui/icons/Dashboard";
import DashboardPage from "views/Dashboard/Dashboard.js";
import Board from "views/Board/Boards";
import MyProfile from "views/MyProfile/MyProfile";
import MyTask from "views/MyTask/MyTask";
import MySchedule from "views/MySchedule/MySchedule";
import UserList from "views/Table/UserList";
import Login from "views/Login/Login";
import Register from "views/Login/Register";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: Dashboard,
    component: DashboardPage,
    layout: "/admin",
    loggedOnly: false,
    sideOnly: true,
  },
  {
    path: "/board",
    name: "Board",
    icon: "content_paste",
    component: Board,
    layout: "/admin",
    loggedOnly: false,
    sideOnly: true,
  },
  {
    path: "/table",
    name: "User List",
    icon: "content_paste",
    component: UserList,
    layout: "/admin",
    loggedOnly: false,
    sideOnly: true,
  },
  {
    path: "/myprofile",
    name: "My Profile",
    icon: "content_paste",
    component: MyProfile,
    layout: "/admin",
    loggedOnly: true,
    sideOnly: true,
  },
  {
    path: "/myTask",
    name: "My Task",
    icon: "content_paste",
    component: MyTask,
    layout: "/admin",
    loggedOnly: true,
    sideOnly: true,
  },
  {
    path: "/mySchedule",
    name: "My Schedule",
    icon: "content_paste",
    component: MySchedule,
    layout: "/admin",
    loggedOnly: true,
    sideOnly: true,
  },
  {
    path: "/login",
    name: "Login",
    icon: "",
    component: Login,
    layout: "/admin",
    loggedOnly: false,
    sideOnly: false,
  },
  {
    path: "/register",
    name: "Register",
    icon: "",
    component: Register,
    layout: "/admin",
    loggedOnly: false,
    sideOnly: false,
  },
];

export default routes;
