import React, { Component } from "react";
import Parse from "parse";

import { LineShadow } from "Components/Charts";
import { lineChartConfig } from "Constants/chartConfig";

import "chartjs-plugin-datalabels";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    const query = new Parse.Query(Parse.Object.extend("Products"));

    this.state = {
      subscription: query.subscribe()
    };
  }

  async componentDidMount() {
    const subscription = await this.state.subscription;

    const weights = await new Parse.Query(
      Parse.Object.extend("Products")
    ).find();

    await this.setState({
      subscription,
      lineChartConfig: Object.assign({}, lineChartConfig, {
        data: Object.assign({}, lineChartConfig.data, {
          labels: weights.map((w, index) => index),
          datasets: lineChartConfig.data.datasets.map(dataset =>
            Object.assign({}, dataset, {
              data: weights.map(w => w.get("weight"))
            })
          )
        })
      })
    });

    this.state.subscription.on("open", () => {
      console.log("subscription opened");
    });

    this.state.subscription.on("create", object => {
      console.log("data", [
        ...this.state.lineChartConfig.data.datasets[0].data,
        object.get("weight")
      ]);
      console.log("labels", [
        ...this.state.lineChartConfig.data.labels,
        this.state.lineChartConfig.data.labels.length
      ]);
      this.setState({
        lineChartConfig: Object.assign({}, this.state.lineChartConfig, {
          data: Object.assign({}, this.state.lineChartConfig.data, {
            labels: [
              ...this.state.lineChartConfig.data.labels.map(
                (w, index) => index
              ),
              this.state.lineChartConfig.data.labels.length
            ],
            datasets: this.state.lineChartConfig.data.datasets.map(dataset =>
              Object.assign({}, dataset, {
                data: [...dataset.data, object.get("weight")]
              })
            )
          })
        })
      });
    });

    this.state.subscription.on("update", object => {
      console.log("object updated", object);
    });

    this.state.subscription.on("close", object => {
      console.log("subscription closed");
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <div className="dashboard-line-chart">
        <LineShadow {...this.state.lineChartConfig} />
      </div>
    );
  }
}

export default Dashboard;
