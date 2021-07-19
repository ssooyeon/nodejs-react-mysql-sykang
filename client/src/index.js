import React from "react";
import ReactDOM from "react-dom";
import AlertMUITemplate from "react-alert-template-mui";
import App from "./App";
import "assets/css/material-dashboard-react.css?v=1.9.0";

import { positions, Provider as AlertProvider } from "react-alert";
import { Provider } from "react-redux";
import store from "./store";

const options = {
  position: positions.MIDDLE,
};

ReactDOM.render(
  <AlertProvider template={AlertMUITemplate} {...options}>
    <Provider store={store}>
      <App />
    </Provider>
  </AlertProvider>,
  document.getElementById("root")
);
