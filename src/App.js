import React from "react";
import ReactDOM from "react-dom";
import Parse from "parse";

import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import App from "Containers/App";
import { configureStore } from "Redux/store";
import { appId, serverUrl, javascriptKey } from "Constants/defaultValues";

Parse.initialize(appId, javascriptKey);
Parse.serverURL = serverUrl;

const MainApp = () => (
  <Provider store={configureStore()}>
    <Router>
      <Switch>
        <Route path="/" component={App} />
      </Switch>
    </Router>
  </Provider>
);

export default ReactDOM.render(<MainApp />, document.getElementById("root"));
