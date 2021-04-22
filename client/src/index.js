import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "assets/css/material-dashboard-react.css?v=1.9.0";

import { Provider } from "react-redux";
import store from "./store";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
