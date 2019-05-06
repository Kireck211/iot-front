import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import dashboard from "./dashboard";
import analytics from "./analytics";

export default ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/dashboard`} />
    <Route path={`${match.url}/dashboard`} component={dashboard} />
    <Route path={`${match.url}/analytics`} component={analytics} />
  </Switch>
);
