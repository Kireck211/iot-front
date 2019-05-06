import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import list from "./list";
import form from "./form";

export default ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/orders`} />
    <Route path={`${match.url}/orders/create`} component={form} />
    <Route path={`${match.url}/orders/edit/:id`} component={form} />
    <Route path={`${match.url}/orders`} component={list} />
  </Switch>
);
