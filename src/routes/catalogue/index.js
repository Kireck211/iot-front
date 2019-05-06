import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import users from "./users";
import products from "./products";
import recipes from "./recipes";
import orders from "./orders";

export default ({ match }) => (
  <Switch>
    <Redirect exact from={`${match.url}/`} to={`${match.url}/users`} />
    <Route path={`${match.url}/users`} component={users} />
    <Route path={`${match.url}/products`} component={products} />
    <Route path={`${match.url}/recipes`} component={recipes} />
    <Route path={`${match.url}/orders`} component={orders} />
  </Switch>
);
