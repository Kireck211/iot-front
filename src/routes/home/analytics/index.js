import React, { Component, Fragment } from "react";
import { Row, Card, CardTitle, CardBody, Table } from "reactstrap";
import IntlMessages from "Util/IntlMessages";
import { Colxx } from "Components/CustomBootstrap";
import Parse from "parse";

class Analytics extends Component {
  constructor(props) {
    super(props);

    this.materialAttributes = ["name", "quantity"];
    this.userAttributes = ["name", "lastName"];

    const query = new Parse.Query(Parse.Object.extend("Product")).equalTo(
      "objectId",
      "Dj3mjID7eV"
    );

    this.state = {
      isLoading: false,
      materials: [],
      products: [],
      subscription: query.subscribe()
    };
  }

  async componentDidMount() {
    let products = await new Parse.Query(Parse.Object.extend("Product")).find();

    products = products.map(product => ({
      id: product.id,
      name: product.get("name"),
      product: product
    }));

    products = await Promise.all(
      products.map(
        product =>
          new Promise((resolve, reject) => {
            new Parse.Query(Parse.Object.extend("Used"))
              .equalTo("product", product.product)
              .includeAll()
              .find()
              .then(used => {
                if (used.length > 0) {
                  const quantityId = "NSnhJWAt2H";
                  const timeId = "qVEJuGqO9g";

                  const preUsers = used.reduce((obj, actual) => {
                    const { id } = actual.get("user");
                    const name = actual.get("user").get("name");

                    const material = {
                      id: actual.get("material").id,
                      name: actual.get("material").get("name")
                    };
                    if (obj.hasOwnProperty(id)) {
                      if (actual.get("material").id === quantityId)
                        obj[id].quantity = actual.get("quantity");
                      else if (actual.get("material").id === timeId)
                        obj[id].time = actual.get("quantity");
                      else
                        obj[id].materials = [
                          ...obj[id].materials,
                          { ...material, quantity: actual.get("quantity") }
                        ].sort((a, b) => (a.name > b.name ? 1 : -1));
                    } else {
                      obj[id] = { name, materials: [] };
                      if (actual.get("material").id === quantityId)
                        obj[id].quantity = actual.get("quantity");
                      else if (actual.get("material").id === timeId)
                        obj[id].time = actual.get("quantity");
                      else
                        obj[id].materials = [
                          { ...material, quantity: actual.get("quantity") }
                        ];
                    }
                    return obj;
                  }, {});

                  let users = [];

                  for (let userId in preUsers) {
                    users = [
                      ...users,
                      {
                        id: userId,
                        ...preUsers[userId]
                      }
                    ];
                  }

                  resolve({
                    id: product.id,
                    name: product.name,
                    users
                  });
                } else {
                  resolve({});
                }
              })
              .catch(error => reject(error));
          })
      )
    );

    products = products.filter(product => product.id);

    let materials = await new Parse.Query(Parse.Object.extend("Material"))
      .exists("quantity")
      .find();
    materials = materials
      .map(material => ({ name: material.get("name"), id: material.id }))
      .sort((a, b) => (a.name > b.name ? 1 : -1));

    this.setState({ materials, products, isLoading: true });
  }

  render() {
    return !this.state.isLoading ? (
      <div className="loading" />
    ) : (
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <CardTitle>
                <IntlMessages id="analytics.performance" />
              </CardTitle>
              <Table className="text-center">
                <thead>
                  <tr>
                    <th>
                      <IntlMessages id="analytics.user" />
                    </th>
                    <th>
                      <IntlMessages id="analytics.product" />
                    </th>
                    <th>
                      <IntlMessages id="analytics.time" />
                    </th>
                    <th>
                      <IntlMessages id="analytics.quantity" />
                    </th>
                    {this.state.materials.map(material => (
                      <th key={material.id}>{material.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {this.state.products.map(product =>
                    product.users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{product.name}</td>
                        <td>{user.time.toFixed(2)}</td>
                        <td>{user.quantity.toFixed(2)}</td>
                        {user.materials.map(material => (
                          <td key={material.id}>
                            {material.quantity.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    );
  }
}

export default Analytics;
