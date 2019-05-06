import React from "react";
import { Route, Switch } from "react-router-dom";

import list from "./list";
import form from "./form";

export default ({ match }) => (
  <Switch>
    <Route path={`${match.url}/`} component={list} />
    <Route path={`${match.url}/create`} component={form} />
    <Route path={`${match.url}/edit/:id`} component={form} />
  </Switch>
);
