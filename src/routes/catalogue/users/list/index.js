import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import {
  Row,
  Card,
  CustomInput,
  Label,
  Button,
  ButtonDropdown,
  Collapse,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Input,
  CardBody,
  CardText
} from "reactstrap";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import classnames from "classnames";
import Parse from "parse";
import moment from "moment";

import IntlMessages from "Util/IntlMessages";
import { Colxx, Separator } from "Components/CustomBootstrap";
import { BreadcrumbItems } from "Components/BreadcrumbContainer";
import { createNotification } from "Redux/actions";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
function collect(props) {
  return { data: props.data };
}

class UsersList extends Component {
  constructor(props) {
    super(props);

    this.attrs = ["name", "lastName", "email"];
    this.filterItem = (item, search) =>
      typeof item === "string"
        ? item.toLowerCase().includes(search.toLowerCase())
        : (this.getIndex = this.getIndex.bind(this));
    this.toggleSplit = this.toggleSplit.bind(this);
    this.dataListRender = this.dataListRender.bind(this);
    this.filterOrderItems = this.filterOrderItems.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.onContextMenuClick = this.onContextMenuClick.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.toggleDisplayOptions = this.toggleDisplayOptions.bind(this);

    this.state = {
      displayMode: "list",
      dropdownSplitOpen: false,
      search: "",
      selectedItems: [],
      lastChecked: null,
      displayOptionsIsOpen: false,
      isLoading: false
    };
  }

  componentWillMount() {
    this.props.bindShortcut(["ctrl+a", "command+a"], () =>
      this.handleChangeSelectAll(false)
    );
    this.props.bindShortcut(["ctrl+d", "command+d"], () => {
      this.setState({
        selectedItems: []
      });
      return false;
    });
  }

  toggleDisplayOptions() {
    this.setState({ displayOptionsIsOpen: !this.state.displayOptionsIsOpen });
  }

  toggleSplit() {
    this.setState(prevState => ({
      dropdownSplitOpen: !prevState.dropdownSplitOpen
    }));
  }

  handleCheckChange(event, id) {
    if (
      event.target.tagName == "A" ||
      (event.target.parentElement && event.target.parentElement.tagName == "A")
    ) {
      return true;
    }
    if (this.state.lastChecked == null) {
      this.setState({
        lastChecked: id
      });
    }

    let selectedItems = this.state.selectedItems;
    if (selectedItems.includes(id)) {
      selectedItems = selectedItems.filter(x => x !== id);
    } else {
      selectedItems.push(id);
    }
    this.setState({
      selectedItems
    });

    if (event.shiftKey) {
      var items = this.state.items;
      var start = this.getIndex(id, items, "id");
      var end = this.getIndex(this.state.lastChecked, items, "id");
      items = items.slice(Math.min(start, end), Math.max(start, end) + 1);
      selectedItems.push(
        ...items.map(item => {
          return item.id;
        })
      );
      selectedItems = Array.from(new Set(selectedItems));
      this.setState({
        selectedItems
      });
    }
    document.activeElement.blur();
  }

  handleChangeSearch(event) {
    const search = event.target.value;
    this.setState({
      search
    });
  }

  getIndex(value, arr, prop) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][prop] === value) {
        return i;
      }
    }
    return -1;
  }

  handleChangeSelectAll(isToggle) {
    if (this.state.selectedItems.length >= this.state.items.length) {
      if (isToggle) {
        this.setState({
          selectedItems: []
        });
      }
    } else {
      this.setState({
        selectedItems: this.state.items.map(x => x.id)
      });
    }
    document.activeElement.blur();
    return false;
  }

  async handleClickDelete() {
    try {
      await this.setState({ isLoading: false });
      await Parse.Cloud.run("deleteUsers", {
        users: this.state.selectedItems
      });
      this.dataListRender();
    } catch (err) {
      console.error(err);
    }
  }

  componentDidMount() {
    this.dataListRender();
  }

  async dataListRender() {
    try {
      const admins = await Parse.Cloud.run("getAdmins");

      const items = admins.map(item => {
        let parsedItem = this.attrs.reduce((obj, value) => {
          obj[value] = item.get(value);
          return obj;
        }, {});
        parsedItem["id"] = item.id;
        return parsedItem;
      });

      await this.setState({
        items,
        selectedItems: [],
        isLoading: true
      });
    } catch (err) {
      console.error(err);
    }
  }

  onContextMenuClick = (e, data, target) => {
    console.log(
      "onContextMenuClick - selected items",
      this.state.selectedItems
    );
    console.log("onContextMenuClick - action : ", data.action);
  };

  onContextMenu = (e, data) => {
    const clickedProductId = data.data;
    if (!this.state.selectedItems.includes(clickedProductId)) {
      this.setState({
        selectedItems: [clickedProductId]
      });
    }

    return true;
  };

  filterOrderItems() {
    const { items, search, filterItem, sortItem } = this.state;
    return items
      .filter(item => filterItem(item, search))
      .sort((left, right) => sortItem(left, right));
  }

  render() {
    const { path } = this.props.match;
    const { messages } = this.props.intl;
    const filteredOrderedItems = this.filterOrderItems();
    return !this.state.isLoading ? (
      <div className="loading" />
    ) : (
      <Fragment>
        <div className="disable-text-selection">
          <Row>
            <Colxx xxs="12">
              <div className="mb-2">
                <h1>
                  <IntlMessages id="menu.users" />
                </h1>

                <div className="float-sm-right">
                  <Link to={path + "/create"}>
                    <Button
                      color="primary"
                      size="lg"
                      className="top-right-button"
                    >
                      <IntlMessages id="menu.create" />
                    </Button>
                  </Link>
                  {"  "}
                  <ButtonDropdown
                    isOpen={this.state.dropdownSplitOpen}
                    toggle={this.toggleSplit}
                  >
                    <div className="btn btn-primary pl-4 pr-0 check-button">
                      <Label
                        for="checkAll"
                        className="custom-control custom-checkbox mb-0 d-inline-block"
                      >
                        <Input
                          className="custom-control-input"
                          type="checkbox"
                          id="checkAll"
                          checked={
                            this.state.selectedItems.length >=
                              this.state.items.length &&
                            this.state.items.length > 0
                          }
                          onClick={() => this.handleChangeSelectAll(true)}
                          onChange={() => {}}
                        />
                        <span
                          className={`custom-control-label ${
                            this.state.selectedItems.length > 0 &&
                            this.state.selectedItems.length <
                              this.state.items.length
                              ? "indeterminate"
                              : ""
                          }`}
                        />
                      </Label>
                    </div>
                    <DropdownToggle
                      caret
                      color="primary"
                      className="dropdown-toggle-split pl-2 pr-2"
                    />
                    <DropdownMenu right>
                      <DropdownItem onClick={() => this.deleteSelected()}>
                        <IntlMessages id="general.delete" />
                      </DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>

                <BreadcrumbItems match={this.props.match} />
              </div>

              <div className="mb-2">
                <Button
                  color="empty"
                  className="pt-0 pl-0 d-inline-block d-md-none"
                  onClick={this.toggleDisplayOptions}
                >
                  <IntlMessages id="awards.display-options" />{" "}
                  <i className="simple-icon-arrow-down align-middle" />
                </Button>
                <Collapse
                  isOpen={this.state.displayOptionsIsOpen}
                  className="d-md-block"
                  id="displayOptions"
                >
                  <span className="mr-3 mb-2 d-inline-block float-md-left">
                    <a
                      className={`mr-2 view-icon ${
                        this.state.displayMode === "list" ? "active" : ""
                      }`}
                      onClick={() => this.changeDisplayMode("list")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 19 19"
                      >
                        <path
                          className="view-icon-svg"
                          d="M17.5,3H.5a.5.5,0,0,1,0-1h17a.5.5,0,0,1,0,1Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M17.5,10H.5a.5.5,0,0,1,0-1h17a.5.5,0,0,1,0,1Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M17.5,17H.5a.5.5,0,0,1,0-1h17a.5.5,0,0,1,0,1Z"
                        />
                      </svg>
                    </a>
                    <a
                      className={`mr-2 view-icon ${
                        this.state.displayMode === "thumblist" ? "active" : ""
                      }`}
                      onClick={() => this.changeDisplayMode("thumblist")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 19 19"
                      >
                        <path
                          className="view-icon-svg"
                          d="M17.5,3H6.5a.5.5,0,0,1,0-1h11a.5.5,0,0,1,0,1Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M3,2V3H1V2H3m.12-1H.88A.87.87,0,0,0,0,1.88V3.12A.87.87,0,0,0,.88,4H3.12A.87.87,0,0,0,4,3.12V1.88A.87.87,0,0,0,3.12,1Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M3,9v1H1V9H3m.12-1H.88A.87.87,0,0,0,0,8.88v1.24A.87.87,0,0,0,.88,11H3.12A.87.87,0,0,0,4,10.12V8.88A.87.87,0,0,0,3.12,8Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M3,16v1H1V16H3m.12-1H.88a.87.87,0,0,0-.88.88v1.24A.87.87,0,0,0,.88,18H3.12A.87.87,0,0,0,4,17.12V15.88A.87.87,0,0,0,3.12,15Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M17.5,10H6.5a.5.5,0,0,1,0-1h11a.5.5,0,0,1,0,1Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M17.5,17H6.5a.5.5,0,0,1,0-1h11a.5.5,0,0,1,0,1Z"
                        />
                      </svg>
                    </a>
                    <a
                      className={`mr-2 view-icon ${
                        this.state.displayMode === "imagelist" ? "active" : ""
                      }`}
                      onClick={() => this.changeDisplayMode("imagelist")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 19 19"
                      >
                        <path
                          className="view-icon-svg"
                          d="M7,2V8H1V2H7m.12-1H.88A.87.87,0,0,0,0,1.88V8.12A.87.87,0,0,0,.88,9H7.12A.87.87,0,0,0,8,8.12V1.88A.87.87,0,0,0,7.12,1Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M17,2V8H11V2h6m.12-1H10.88a.87.87,0,0,0-.88.88V8.12a.87.87,0,0,0,.88.88h6.24A.87.87,0,0,0,18,8.12V1.88A.87.87,0,0,0,17.12,1Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M7,12v6H1V12H7m.12-1H.88a.87.87,0,0,0-.88.88v6.24A.87.87,0,0,0,.88,19H7.12A.87.87,0,0,0,8,18.12V11.88A.87.87,0,0,0,7.12,11Z"
                        />
                        <path
                          className="view-icon-svg"
                          d="M17,12v6H11V12h6m.12-1H10.88a.87.87,0,0,0-.88.88v6.24a.87.87,0,0,0,.88.88h6.24a.87.87,0,0,0,.88-.88V11.88a.87.87,0,0,0-.88-.88Z"
                        />
                      </svg>
                    </a>
                  </span>

                  <div className="d-block d-md-inline-block">
                    <div className="search-sm d-inline-block float-md-left mr-1 mb-1 align-top">
                      <input
                        type="text"
                        name="keyword"
                        id="search"
                        placeholder={messages["menu.search"]}
                        onChange={this.handleChangeSearch}
                      />
                    </div>
                  </div>
                </Collapse>
              </div>
              <Separator className="mb-5" />
            </Colxx>
          </Row>
          <Row>
            {this.state.items.filter(product =>
              product.title.toLowerCase().includes(this.state.search)
            ).length > 0 ? (
              this.state.items
                .filter(product =>
                  product.title.toLowerCase().includes(this.state.search)
                )
                .map(product => {
                  if (this.state.displayMode === "imagelist") {
                    return (
                      <Colxx
                        sm="6"
                        lg="4"
                        xl="3"
                        className="mb-3"
                        key={product.objectId}
                      >
                        <ContextMenuTrigger
                          id="menu_id"
                          data={product.objectId}
                          collect={collect}
                        >
                          <Card
                            onClick={event =>
                              this.handleCheckChange(event, product.objectId)
                            }
                            className={classnames({
                              active: this.state.selectedItems.includes(
                                product.objectId
                              )
                            })}
                          >
                            <div className="d-flex p-3">
                              <Link
                                to={`${this.props.match.path}/edit/${
                                  product.objectId
                                }`}
                                style={{ width: "100%" }}
                                className="d-flex justify-content-center"
                              >
                                <img
                                  alt={product.title}
                                  src={product.img}
                                  style={{
                                    maxHeight: "150px",
                                    maxWidth: "150px"
                                  }}
                                />
                              </Link>
                            </div>
                            <CardBody>
                              <Row>
                                <Colxx xxs="2">
                                  <CustomInput
                                    className="itemCheck mb-0"
                                    type="checkbox"
                                    id={`check_${product.objectId}`}
                                    checked={this.state.selectedItems.includes(
                                      product.objectId
                                    )}
                                    onChange={() => {}}
                                    label=""
                                  />
                                </Colxx>
                                <Colxx xxs="10" className="mb-3">
                                  <CardText className="text-muted text-small mb-0 font-weight-light">
                                    {product.title}
                                  </CardText>
                                </Colxx>
                              </Row>
                            </CardBody>
                          </Card>
                        </ContextMenuTrigger>
                      </Colxx>
                    );
                  } else if (this.state.displayMode === "thumblist") {
                    return (
                      <Colxx xxs="12" key={product.objectId} className="mb-3">
                        <ContextMenuTrigger
                          id="menu_id"
                          data={product.objectId}
                          collect={collect}
                        >
                          <Card
                            onClick={event =>
                              this.handleCheckChange(event, product.objectId)
                            }
                            className={classnames("d-flex flex-row", {
                              active: this.state.selectedItems.includes(
                                product.objectId
                              )
                            })}
                          >
                            <Link
                              to={`${this.props.match.path}/edit/${
                                product.objectId
                              }`}
                              className="d-flex align-items-center pl-2"
                            >
                              <img
                                alt={product.title}
                                src={product.img}
                                className="list-thumbnail responsive border-0"
                              />
                            </Link>
                            <div className="pl-2 d-flex flex-grow-1 min-width-zero">
                              <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                                <Link
                                  to={`${this.props.match.path}/edit/${
                                    product.objectId
                                  }`}
                                  className="w-30"
                                >
                                  <p className="list-item-heading mb-1 truncate">
                                    {product.title}
                                  </p>
                                </Link>
                                <p
                                  className="mb-1 text-muted text-small text-justify p-lg-3"
                                  style={{ maxWidth: "60%" }}
                                >
                                  {product.description}
                                </p>
                                <p className="mb-1 text-muted text-small w-25 w-sm-100 text-center">
                                  {moment(product.date).format("LL")}
                                </p>
                              </div>
                              <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                                <CustomInput
                                  className="itemCheck mb-0"
                                  type="checkbox"
                                  id={`check_${product.objectId}`}
                                  checked={this.state.selectedItems.includes(
                                    product.objectId
                                  )}
                                  onChange={() => {}}
                                  label=""
                                />
                              </div>
                            </div>
                          </Card>
                        </ContextMenuTrigger>
                      </Colxx>
                    );
                  } else {
                    // display mode list
                    return (
                      <Colxx xxs="12" key={product.objectId} className="mb-3">
                        <ContextMenuTrigger
                          id="menu_id"
                          data={product.objectId}
                          collect={collect}
                        >
                          <Card
                            onClick={event =>
                              this.handleCheckChange(event, product.objectId)
                            }
                            className={classnames("d-flex flex-row", {
                              active: this.state.selectedItems.includes(
                                product.objectId
                              )
                            })}
                          >
                            <div className="pl-2 d-flex flex-grow-1">
                              <div className="card-body d-flex flex-column flex-lg-row justify-content-between align-items-center">
                                <Link
                                  to={`${this.props.match.path}/edit/${
                                    product.objectId
                                  }`}
                                  className="w-sm-100 w-20"
                                >
                                  <p className="list-item-heading mb-1 truncate">
                                    {product.title}
                                  </p>
                                </Link>
                                <p
                                  className="mb-1 text-muted text-small"
                                  style={{
                                    maxWidth: "50%",
                                    textAlign: "justify"
                                  }}
                                >
                                  {product.description}
                                </p>
                                <p className="mb-1 text-muted text-small w-20 w-sm-100">
                                  {moment(product.date).format("LL")}
                                </p>
                              </div>
                              <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                                <CustomInput
                                  className="itemCheck mb-0"
                                  type="checkbox"
                                  id={`check_${product.objectId}`}
                                  checked={this.state.selectedItems.includes(
                                    product.objectId
                                  )}
                                  onChange={() => {}}
                                  label=""
                                />
                              </div>
                            </div>
                          </Card>
                        </ContextMenuTrigger>
                      </Colxx>
                    );
                  }
                })
            ) : (
              <h1>
                <IntlMessages id="general.no-elements" />
              </h1>
            )}
          </Row>
        </div>

        <ContextMenu
          id="menu_id"
          onShow={e => this.onContextMenu(e, e.detail.data)}
        >
          <MenuItem onClick={this.onContextMenuClick} data={{ action: "copy" }}>
            <i className="simple-icon-docs" /> <span>Copy</span>
          </MenuItem>
          <MenuItem onClick={this.onContextMenuClick} data={{ action: "move" }}>
            <i className="simple-icon-drawer" /> <span>Move to archive</span>
          </MenuItem>
          <MenuItem
            onClick={this.onContextMenuClick}
            data={{ action: "delete" }}
          >
            <i className="simple-icon-trash" /> <span>Delete</span>
          </MenuItem>
        </ContextMenu>
      </Fragment>
    );
  }
}

const mapStateToProps = ({ settings }) => {
  const { locale } = settings;
  return { locale };
};

export default connect(
  mapStateToProps,
  { createNotification }
)(injectIntl(mouseTrap(DataListLayout)));
