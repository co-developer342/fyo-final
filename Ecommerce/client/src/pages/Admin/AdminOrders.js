import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select, Input, DatePicker } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminOrders = () => {
  const [statusOptions, setStatusOptions] = useState([
    "Not Process",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [auth, setAuth] = useAuth();

  // Filter states
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBuyer, setFilterBuyer] = useState("");
  const [filterQuantity, setFilterQuantity] = useState("");
  const [filterDateRange, setFilterDateRange] = useState([]);

  const getOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const handleChange = async (orderId, value) => {
    try {
      const { data } = await axios.put(`/api/v1/auth/order-status/${orderId}`, {
        status: value,
      });
      getOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const calculateTotalPrice = (products) => {
    return products.reduce((total, product) => total + product.price, 0);
  };

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "" || order.status === filterStatus;
    const matchesBuyer =
      filterBuyer === "" ||
      order.buyer?.name.toLowerCase().includes(filterBuyer.toLowerCase());
    const matchesQuantity =
      filterQuantity === "" ||
      order.products.length === parseInt(filterQuantity, 10);
    const matchesDateRange =
      filterDateRange.length === 0 ||
      (moment(order.createdAt).isSameOrAfter(filterDateRange[0], "day") &&
        moment(order.createdAt).isSameOrBefore(filterDateRange[1], "day"));
    return matchesStatus && matchesBuyer && matchesQuantity && matchesDateRange;
  });

  return (
    <Layout title={"All Orders Data"}>
      <div className="row dashboard">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h5
            className="text-center"
            style={{ margin: "10px", fontSize: "30px" }}
          >
            All Orders
          </h5>

          {/* Filters */}
          <div className="filters mb-3">
            <Select
              placeholder="Filter by Status"
              style={{ width: 150, marginRight: 10 }}
              onChange={(value) => setFilterStatus(value)}
              allowClear
            >
              {statusOptions.map((status, index) => (
                <Option key={index} value={status}>
                  {status}
                </Option>
              ))}
            </Select>

            <Input
              placeholder="Filter by Buyer"
              style={{ width: 150, marginRight: 10 }}
              value={filterBuyer}
              onChange={(e) => setFilterBuyer(e.target.value)}
            />

            <Input
              placeholder="Filter by Quantity"
              style={{ width: 150, marginRight: 10 }}
              value={filterQuantity}
              type="number"
              onChange={(e) => setFilterQuantity(e.target.value)}
            />

            <RangePicker
              style={{ marginRight: 10 }}
              onChange={(dates) => setFilterDateRange(dates)}
              format="M/D/YYYY"
            />

            <button
              className="btn btn-danger"
              onClick={() => {
                setFilterStatus("");
                setFilterBuyer("");
                setFilterQuantity("");
                setFilterDateRange([]);
              }}
            >
              Clear Filters
            </button>
          </div>

          {/* Orders Table */}
          <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Status</th>
                <th scope="col">Buyer</th>
                <th scope="col">Date</th>
                <th scope="col">Payment</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total Price</th>{" "}
                {/* New Column for Total Price */}
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map((o, i) => (
                <React.Fragment key={o._id}>
                  <tr>
                    <td>{i + 1}</td>
                    <td>
  <Select
    bordered={false}
    onChange={(value) => handleChange(o._id, value)}
    defaultValue={o?.status}
    disabled={o?.status === "Cancelled" || o?.status === "Cancel" } // Disable if status is "Cancelled"
  >
    {statusOptions.map((status, i) => (
      <Option key={i} value={status}>
        {status}
      </Option>
    ))}
  </Select>
</td>

                    <td>{o?.buyer?.name}</td>
                    <td>{moment(o?.createdAt).format("M/D/YYYY")}</td>
                    <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                    <td>{o?.products?.length}</td>
                    <td>{calculateTotalPrice(o?.products)}</td>{" "}
                    {/* Display Total Price */}
                    <td>
                      {expandedOrder === o._id ? (
                        <UpOutlined
                          onClick={() => toggleOrderDetails(o._id)}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <DownOutlined
                          onClick={() => toggleOrderDetails(o._id)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                  </tr>
                  {expandedOrder === o._id && (
                    <tr>
                      <td colSpan="8">
                        <table className="table table-bordered mt-2">
                          <thead>
                            <tr>
                              <th scope="col">Product Image</th>
                              <th scope="col">Name</th>
                              <th scope="col">Description</th>
                              <th scope="col">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o?.products?.map((p) => (
                              <tr key={p._id}>
                                <td>
                                  <img
                                    src={`/api/v1/product/product-photo/${p._id}`}
                                    alt={p.name}
                                    width="50px"
                                    height="50px"
                                  />
                                </td>
                                <td>{p.name}</td>
                                <td>{p.description.substring(0, 30)}</td>
                                <td>{p.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;
