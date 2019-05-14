import React, { Component } from "react";
import { Row, Card, CardTitle, CardBody, Table } from "reactstrap";
import IntlMessages from "Util/IntlMessages";
import { Colxx } from "Components/CustomBootstrap";
import Parse from "parse";

import { LineShadow } from "Components/Charts";
import { lineChartConfig } from "Constants/chartConfig";

import "chartjs-plugin-datalabels";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    const query = new Parse.Query(Parse.Object.extend("Material")).exists(
      "quantity"
    );

    this.state = {
      isLoading: false,
      subscription: query.subscribe(),
      materials: []
    };
  }

  async componentDidMount() {
    const materials = await new Parse.Query(Parse.Object.extend("Material"))
      .exists("quantity")
      .find();

    const subscription = await this.state.subscription;

    await this.setState({
      isLoading: true,
      subscription,
      materials: materials.map(material => ({
        id: material.id,
        name: material.get("name"),
        quantity: parseInt(material.get("quantity"))
      }))
    });

    this.state.subscription.on("open", () => {
      console.log("subscription opened");
    });

    this.state.subscription.on("update", object => {
      const { materials } = this.state;
      const index = materials.findIndex(material => object.id === material.id);
      this.setState({
        materials: [
          ...materials.slice(0, index),
          { ...materials[index], quantity: parseInt(object.get("quantity")) },
          ...materials.slice(index + 1, materials.length)
        ]
      });
    });

    this.state.subscription.on("close", object => {
      console.log("subscription closed");
    });
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
                <IntlMessages id="dashboard.inventory" />
                <Table className="mt-5 text-center">
                  <thead>
                    <tr>
                      <th>
                        <IntlMessages id="dashboard.raw" />
                      </th>
                      <th>
                        <IntlMessages id="dashboard.quantity" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.materials.map(material => (
                      <tr key={material.id}>
                        <td>{material.name}</td>
                        <td>{material.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardTitle>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    );
  }
}

export default Dashboard;
