import {
  Activity,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShoppingCart,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import "./App.css";

const GRAPHQL_URL = "http://127.0.0.1:4000/graphql";

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");

  /* =======================================================
     FETCH ORDERS
  ======================================================= */

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query: `
            {
              orders {
                id
                productId
                quantity
                status
              }
            }
          `,
        }),
      });

      const result = await response.json();

      if (result.data?.orders) {
        setOrders(result.data.orders);
      }
    } catch (error) {
      console.error("Unable to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredOrders = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return orders;
    }

    return orders.filter(
      (order) =>
        String(order.id).includes(value) ||
        order.productId.toLowerCase().includes(value) ||
        order.status.toLowerCase().includes(value)
    );
  }, [orders, search]);

  /* =======================================================
     DASHBOARD STATS
  ======================================================= */

  const totalOrders = orders.length;

  const totalItems = orders.reduce(
    (total, order) => total + order.quantity,
    0
  );

  const uniqueProducts = new Set(
    orders.map((order) => order.productId)
  ).size;

  const createdOrders = orders.filter(
    (order) => order.status === "CREATED"
  ).length;

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      icon: ShoppingCart,
    },
    {
      name: "Create Order",
      icon: Plus,
    },
    {
      name: "Inventory",
      icon: Boxes,
    },
    {
      name: "Notifications",
      icon: Bell,
    },
    {
      name: "Services",
      icon: Server,
    },
  ];

  /* =======================================================
     SERVICES
  ======================================================= */

  const services = [
    ["GraphQL API", "GraphQL", "4000"],
    ["Order Service", "TypeScript", "3001"],
    ["Inventory Service", "gRPC", "50051"],
    ["Kafka", "Event Streaming", "9092"],
    ["PostgreSQL", "Database", "5432"],
    ["Notification Service", "Kafka Consumer", "Internal"],
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app-shell">

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="brand">

          <div className="brand-logo">
            <ShoppingCart size={21} />
          </div>

          <div>
            <h1>ShopStream</h1>
            <span>EVENT PLATFORM</span>
          </div>

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

        </div>

        <div className="nav-label">
          MAIN MENU
        </div>

        <nav>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />

                <span>{item.name}</span>

                {activePage === item.name && (
                  <ChevronRight
                    size={16}
                    className="nav-arrow"
                  />
                )}
              </button>
            );
          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="system-status">

            <div className="status-dot" />

            <div>
              <strong>All Systems Online</strong>
              <span>ShopStream Platform</span>
            </div>

          </div>

          <div className="version">
            <span>Version</span>
            <strong>1.0.0</strong>
          </div>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">

            <span>ShopStream</span>

            <ChevronRight size={15} />

            <strong>{activePage}</strong>

          </div>

          <div className="topbar-actions">

            <div className="online-pill">
              <span />
              System Online
            </div>

            <button
              className="refresh-button"
              onClick={fetchOrders}
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={loading ? "spin" : ""}
              />
            </button>

            <div className="avatar">
              V
            </div>

          </div>

        </header>

        {/* CONTENT */}

        <section className="content">

          {/* DASHBOARD */}

          {activePage === "Dashboard" && (
            <Dashboard
              orders={orders}
              totalOrders={totalOrders}
              totalItems={totalItems}
              uniqueProducts={uniqueProducts}
              createdOrders={createdOrders}
              services={services}
              setActivePage={setActivePage}
            />
          )}

          {/* ORDERS */}

          {activePage === "Orders" && (
            <OrdersPage
              orders={filteredOrders}
              search={search}
              setSearch={setSearch}
              loading={loading}
              fetchOrders={fetchOrders}
              setActivePage={setActivePage}
            />
          )}

          {/* CREATE ORDER */}

          {activePage === "Create Order" && (
            <CreateOrderPage
              fetchOrders={fetchOrders}
              setActivePage={setActivePage}
            />
          )}

          {/* INVENTORY */}

          {activePage === "Inventory" && (
            <InventoryPage />
          )}

          {/* NOTIFICATIONS */}

          {activePage === "Notifications" && (
            <NotificationsPage orders={orders} />
          )}

          {/* SERVICES */}

          {activePage === "Services" && (
            <ServicesPage services={services} />
          )}

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  orders,
  totalOrders,
  totalItems,
  uniqueProducts,
  createdOrders,
  services,
  setActivePage,
}) {
  return (
    <>
      <div className="hero">

        <div>

          <p className="eyebrow">
            MICROSERVICES CONTROL CENTER
          </p>

          <h2>
            Welcome to <span>ShopStream.</span>
          </h2>

          <p className="hero-description">
            Monitor orders, services, inventory and
            event-driven workflows from one place.
          </p>

        </div>

        <div className="hero-badge">

          <Activity size={18} />

          <div>
            <strong>Event-Driven</strong>
            <span>Architecture</span>
          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="stats-grid">

        <StatCard
          icon={<ShoppingCart size={21} />}
          label="Total Orders"
          value={totalOrders}
          detail="Across all orders"
        />

        <StatCard
          icon={<Package size={21} />}
          label="Items Ordered"
          value={totalItems}
          detail="Total quantity"
        />

        <StatCard
          icon={<Boxes size={21} />}
          label="Products"
          value={uniqueProducts}
          detail="Unique products"
        />

        <StatCard
          icon={<CheckCircle2 size={21} />}
          label="Created Orders"
          value={createdOrders}
          detail="Successfully processed"
        />

      </div>

      {/* DASHBOARD GRID */}

      <div className="dashboard-grid">

        <section className="panel orders-panel">

          <div className="panel-header">

            <div>
              <p className="panel-kicker">
                DATABASE
              </p>

              <h3>
                Recent Orders
              </h3>
            </div>

            <button
              className="view-button"
              onClick={() => setActivePage("Orders")}
            >
              View all
              <ChevronRight size={15} />
            </button>

          </div>

          <OrderTable
            orders={orders.slice(0, 6)}
          />

        </section>

        <section className="panel architecture-panel">

          <div className="panel-header">

            <div>
              <p className="panel-kicker">
                INFRASTRUCTURE
              </p>

              <h3>
                Service Health
              </h3>
            </div>

            <Activity
              size={19}
              className="health-icon"
            />

          </div>

          <ServiceList services={services} />

        </section>

      </div>

      {/* BOTTOM GRID */}

      <div className="bottom-grid">

        <section className="panel event-panel">

          <div className="panel-header">

            <div>
              <p className="panel-kicker">
                EVENT STREAMING
              </p>

              <h3>
                Kafka Activity
              </h3>
            </div>

            <div className="live-label">

              <Radio size={14} />

              LIVE

            </div>

          </div>

          <div className="event-content">

            <div className="kafka-visual">

              <div className="kafka-ring">
                <Radio size={26} />
              </div>

            </div>

            <div>

              <h4>
                OrderCreated
              </h4>

              <p>
                Order events are published to the{" "}
                <strong>orders</strong> Kafka topic
                and consumed by the Notification
                Service.
              </p>

            </div>

          </div>

        </section>

        <section className="panel stack-panel">

          <div className="panel-header">

            <div>
              <p className="panel-kicker">
                TECH STACK
              </p>

              <h3>
                Architecture
              </h3>
            </div>

          </div>

          <div className="stack-tags">

            <span>React</span>
            <span>GraphQL</span>
            <span>TypeScript</span>
            <span>gRPC</span>
            <span>Kafka</span>
            <span>Docker</span>
            <span>PostgreSQL</span>
            <span>Node.js</span>

          </div>

        </section>

      </div>

      <Footer />

    </>
  );
}

/* =========================================================
   ORDERS PAGE
========================================================= */

function OrdersPage({
  orders,
  search,
  setSearch,
  loading,
  fetchOrders,
  setActivePage,
}) {
  return (
    <>
      <div className="page-heading">

        <div>

          <p className="eyebrow">
            ORDER MANAGEMENT
          </p>

          <h2>
            Orders
          </h2>

          <p>
            View and monitor orders received through
            the ShopStream platform.
          </p>

        </div>

        <div style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}>

          <button
            className="primary-action"
            onClick={() => setActivePage("Create Order")}
          >
            <Plus size={16} />
            Create Order
          </button>

          <button
            className="primary-action"
            onClick={fetchOrders}
          >
            <RefreshCw
              size={16}
              className={loading ? "spin" : ""}
            />
            Refresh Orders
          </button>

        </div>

      </div>

      <section className="panel full-panel">

        <div className="orders-toolbar">

          <div className="search-box">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search by order ID, product or status..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          <div className="result-count">
            {orders.length} orders
          </div>

        </div>

        <OrderTable
          orders={orders}
          emptyMessage="No orders found."
        />

      </section>

      <Footer />

    </>
  );
}

/* =========================================================
   CREATE ORDER PAGE
========================================================= */

function CreateOrderPage({
  fetchOrders,
  setActivePage,
}) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const products = [
    {
      id: "LAPTOP-001",
      name: "Laptop",
      category: "Computing",
      stock: 10,
    },
    {
      id: "PHONE-001",
      name: "Smartphone",
      category: "Mobile",
      stock: 20,
    },
    {
      id: "MOUSE-001",
      name: "Accessories",
      category: "Accessories",
      stock: 50,
    },
    {
      id: "KEYBOARD-001",
      name: "Keyboard",
      category: "Accessories",
      stock: 30,
    },
    {
      id: "MONITOR-001",
      name: "Monitor",
      category: "Display",
      stock: 15,
    },
    {
      id: "HEADPHONE-001",
      name: "Headphones",
      category: "Audio",
      stock: 40,
    },
    {
      id: "TABLET-001",
      name: "Tablet",
      category: "Mobile",
      stock: 12,
    },
    {
      id: "CAMERA-001",
      name: "Camera",
      category: "Electronics",
      stock: 8,
    },
  ];

  const selectedProduct = products.find(
    (product) => product.id === productId
  );

  /* =======================================================
     CREATE ORDER MUTATION
  ======================================================= */

  const createOrder = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!productId) {
      setErrorMessage("Please select a product.");
      return;
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      setErrorMessage(
        "Quantity must be a positive integer."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query: `
            mutation CreateOrder(
              $productId: String!
              $quantity: Int!
            ) {
              createOrder(
                productId: $productId
                quantity: $quantity
              ) {
                id
                productId
                quantity
                status
              }
            }
          `,

          variables: {
            productId,
            quantity: Number(quantity),
          },
        }),
      });

      const result = await response.json();

      if (result.errors?.length) {
        throw new Error(
          result.errors[0].message ||
          "Failed to create order."
        );
      }

      const order = result.data?.createOrder;

      if (!order) {
        throw new Error(
          "Order was not created."
        );
      }

      setSuccessMessage(
        `Order #${String(order.id).padStart(
          4,
          "0"
        )} created successfully.`
      );

      setProductId("");
      setQuantity(1);

      await fetchOrders();

    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      setErrorMessage(
        error.message ||
        "Unable to create order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            ORDER MANAGEMENT
          </p>

          <h2>
            Create New Order
          </h2>

          <p>
            Submit an order through the ShopStream
            event-driven architecture.
          </p>
        </div>

        <div className="online-pill">
          <span />
          GraphQL Connected
        </div>

      </div>

      {/* =====================================================
          MAIN ORDER AREA
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
          gap: "20px",
          alignItems: "start",
        }}
      >

        {/* ===================================================
            ORDER FORM
        =================================================== */}

        <section className="panel full-panel">

          <div className="panel-header">

            <div>
              <p className="panel-kicker">
                NEW ORDER
              </p>

              <h3>
                Order Details
              </h3>
            </div>

            <ShoppingCart
              size={21}
              className="health-icon"
            />

          </div>

          {/* SUCCESS MESSAGE */}

          {successMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(34, 197, 94, 0.25)",
                background:
                  "rgba(34, 197, 94, 0.08)",
                color: "#86efac",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
              }}
            >
              <CheckCircle2 size={18} />
              {successMessage}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {errorMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(239, 68, 68, 0.25)",
                background:
                  "rgba(239, 68, 68, 0.08)",
                color: "#fca5a5",
                fontSize: "14px",
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={createOrder}>

            {/* PRODUCT */}

            <div
              style={{
                marginBottom: "22px",
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "9px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#cbd5e1",
                }}
              >
                Product
              </label>

              <select
                value={productId}
                onChange={(event) =>
                  setProductId(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border:
                    "1px solid rgba(148, 163, 184, 0.18)",
                  background: "#0d1420",
                  color: "#e2e8f0",
                  outline: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >

                <option value="">
                  Select a product
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.id} — {product.name}
                  </option>
                ))}

              </select>

            </div>

            {/* SELECTED PRODUCT */}

            {selectedProduct && (
              <div
                style={{
                  marginBottom: "22px",
                  padding: "16px",
                  borderRadius: "14px",
                  border:
                    "1px solid rgba(99, 102, 241, 0.25)",
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(15,23,42,0.55))",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >

                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#818cf8",
                        fontWeight: "700",
                        letterSpacing: "1px",
                        marginBottom: "5px",
                      }}
                    >
                      SELECTED PRODUCT
                    </div>

                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        color: "#f8fafc",
                      }}
                    >
                      {selectedProduct.name}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "4px",
                      }}
                    >
                      {selectedProduct.id}
                      {" • "}
                      {selectedProduct.category}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        marginBottom: "3px",
                      }}
                    >
                      Available Stock
                    </div>

                    <div
                      style={{
                        fontSize: "25px",
                        fontWeight: "800",
                        color: "#4ade80",
                      }}
                    >
                      {selectedProduct.stock}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* QUANTITY */}

            <div
              style={{
                marginBottom: "26px",
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "9px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#cbd5e1",
                }}
              >
                Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border:
                    "1px solid rgba(148, 163, 184, 0.18)",
                  background: "#0d1420",
                  color: "#e2e8f0",
                  outline: "none",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="primary-action"
              disabled={submitting}
              style={{
                width: "100%",
                justifyContent: "center",
                minHeight: "48px",
                opacity:
                  submitting ? 0.7 : 1,
                cursor:
                  submitting
                    ? "not-allowed"
                    : "pointer",
              }}
            >

              {submitting ? (
                <>
                  <RefreshCw
                    size={17}
                    className="spin"
                  />

                  Creating Order...
                </>
              ) : (
                <>
                  <Plus size={18} />

                  Create Order
                </>
              )}

            </button>

          </form>

        </section>

        {/* ===================================================
            ORDER SUMMARY
        =================================================== */}

        <section
          className="panel"
          style={{
            minHeight: "100%",
          }}
        >

          <div className="panel-header">

            <div>
              <p className="panel-kicker">
                ORDER PREVIEW
              </p>

              <h3>
                Summary
              </h3>
            </div>

            <ShoppingCart
              size={20}
              className="health-icon"
            />

          </div>

          <div
            style={{
              padding: "8px 0",
            }}
          >

            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                background:
                  "rgba(15, 23, 42, 0.65)",
                border:
                  "1px solid rgba(148,163,184,0.12)",
                marginBottom: "14px",
              }}
            >

              <p
                style={{
                  margin: "0 0 7px",
                  fontSize: "11px",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Product
              </p>

              <strong
                style={{
                  color: "#f8fafc",
                  fontSize: "15px",
                }}
              >
                {selectedProduct
                  ? selectedProduct.name
                  : "No product selected"}
              </strong>

              {selectedProduct && (
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  {selectedProduct.id}
                </p>
              )}

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "12px",
              }}
            >

              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background:
                    "rgba(15,23,42,0.65)",
                  border:
                    "1px solid rgba(148,163,184,0.12)",
                }}
              >

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  QUANTITY
                </p>

                <strong
                  style={{
                    fontSize: "24px",
                    color: "#f8fafc",
                  }}
                >
                  {quantity || 0}
                </strong>

              </div>

              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background:
                    "rgba(15,23,42,0.65)",
                  border:
                    "1px solid rgba(148,163,184,0.12)",
                }}
              >

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  STATUS
                </p>

                <strong
                  style={{
                    fontSize: "14px",
                    color: selectedProduct
                      ? "#4ade80"
                      : "#64748b",
                  }}
                >
                  {selectedProduct
                    ? "Ready"
                    : "Waiting"}
                </strong>

              </div>

            </div>

            <div
              style={{
                marginTop: "14px",
                padding: "14px",
                borderRadius: "12px",
                background:
                  "rgba(34,197,94,0.06)",
                border:
                  "1px solid rgba(34,197,94,0.14)",
                fontSize: "12px",
                lineHeight: "1.6",
                color: "#94a3b8",
              }}
            >
              <strong
                style={{
                  color: "#86efac",
                }}
              >
                ✓ Stock validation
              </strong>
              <br />
              Inventory availability is checked
              through the gRPC Inventory Service
              before the order is created.
            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          EVENT-DRIVEN ARCHITECTURE
      ===================================================== */}

      <section
        className="panel"
        style={{
          marginTop: "20px",
        }}
      >

        <div className="panel-header">

          <div>
            <p className="panel-kicker">
              EVENT-DRIVEN ARCHITECTURE
            </p>

            <h3>
              Order Processing Flow
            </h3>
          </div>

          <Radio
            size={21}
            className="health-icon"
          />

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5, minmax(0, 1fr))",
            gap: "10px",
          }}
        >

          {[
            {
              number: "01",
              title: "GraphQL",
              text: "API request",
            },
            {
              number: "02",
              title: "Order Service",
              text: "Validate order",
            },
            {
              number: "03",
              title: "gRPC",
              text: "Check inventory",
            },
            {
              number: "04",
              title: "PostgreSQL",
              text: "Store order",
            },
            {
              number: "05",
              title: "Kafka",
              text: "Publish event",
            },
          ].map((step) => (
            <div
              key={step.number}
              style={{
                padding: "17px",
                borderRadius: "13px",
                background:
                  "rgba(15,23,42,0.55)",
                border:
                  "1px solid rgba(148,163,184,0.12)",
              }}
            >

              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#818cf8",
                  letterSpacing: "1px",
                  marginBottom: "9px",
                }}
              >
                STEP {step.number}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#f8fafc",
                  marginBottom: "5px",
                }}
              >
                {step.title}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                {step.text}
              </div>

            </div>
          ))}

        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "14px 16px",
            borderRadius: "12px",
            background:
              "rgba(99,102,241,0.06)",
            border:
              "1px solid rgba(99,102,241,0.12)",
            color: "#94a3b8",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          After PostgreSQL stores the order,
          an <strong>OrderCreated</strong> event
          is published to Apache Kafka and consumed
          by the Notification Service asynchronously.
        </div>

      </section>

      <Footer />

    </>
  );
}
/* =========================================================
   INVENTORY PAGE
========================================================= */
function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
  GRAPHQL_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            query: `
              {
                inventory {
                  productId
                  category
                  stock
                  status
                }
              }
            `,
          }),
        }
      );

      const result = await response.json();

      if (result.errors) {
        throw new Error(
          result.errors[0].message
        );
      }

      setInventory(
        result.data.inventory
      );
    } catch (error) {
      console.error(
        "Inventory fetch failed:",
        error
      );

      setError(
        "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchInventory();
}, []);
  const totalProducts =
    inventory.length;

  const totalStock =
    inventory.reduce(
      (total, item) =>
        total + item.stock,
      0
    );

  const allAvailable =
    inventory.length > 0 &&
    inventory.every(
      (item) =>
        item.status === "Available"
    );

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            INVENTORY SERVICE
          </p>

          <h2>
            Inventory
          </h2>

          <p>
            Product availability managed by the
            gRPC Inventory Service.
          </p>
        </div>

        <div className="online-pill">
          <span />
          Inventory Online
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="panel">
          <p>
            Loading inventory...
          </p>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="panel">
          <p
            style={{
              color: "#f87171",
            }}
          >
            {error}
          </p>
        </div>
      )}

      {/* INVENTORY CONTENT */}

      {!loading && !error && (
        <>
          {/* INVENTORY OVERVIEW */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "16px",
              marginBottom: "22px",
            }}
          >
            {/* TOTAL PRODUCTS */}

            <div className="panel">
              <p className="panel-kicker">
                CATALOG
              </p>

              <h3
                style={{
                  fontSize: "28px",
                  margin: "6px 0",
                  color: "#f8fafc",
                }}
              >
                {totalProducts}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Total Products
              </p>
            </div>

            {/* TOTAL STOCK */}

            <div className="panel">
              <p className="panel-kicker">
                STOCK
              </p>

              <h3
                style={{
                  fontSize: "28px",
                  margin: "6px 0",
                  color: "#4ade80",
                }}
              >
                {totalStock}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Total Units Available
              </p>
            </div>

            {/* SYSTEM STATUS */}

            <div className="panel">
              <p className="panel-kicker">
                SYSTEM STATUS
              </p>

              <h3
                style={{
                  fontSize: "22px",
                  margin: "9px 0",
                  color: "#4ade80",
                }}
              >
                {allAvailable
                  ? "All Available"
                  : "Stock Updated"}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Inventory Service Healthy
              </p>
            </div>
          </div>

          {/* PRODUCT INVENTORY */}

          <div className="inventory-grid">
            {inventory.map(
              (item) => (
                <div
                  className="inventory-card"
                  key={item.productId}
                >
                  <div className="inventory-icon">
                    <Package
                      size={22}
                    />
                  </div>

                  <div className="inventory-card-content">
                    <span>
                      {item.category}
                    </span>

                    <h3>
                      {item.productId}
                    </h3>
                  </div>

                  <div className="inventory-stock">
                    <strong>
                      {item.stock}
                    </strong>

                    <span>
                      units
                    </span>
                  </div>

                  <div className="inventory-status">
                    <i />

                    {item.status}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}

      {/* GRPC INFORMATION */}

      <section className="panel inventory-info">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">
              GRPC
            </p>

            <h3>
              Inventory Communication
            </h3>
          </div>

          <Boxes
            size={21}
            className="health-icon"
          />
        </div>

        <div className="info-content">
          <div className="info-icon">
            <Boxes size={24} />
          </div>

          <p>
            The Order Service uses{" "}
            <strong>
              gRPC + Protocol Buffers
            </strong>{" "}
            to check product availability before
            an order is stored in PostgreSQL.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
/* =========================================================
   NOTIFICATIONS PAGE
========================================================= */

function NotificationsPage({ orders }) {
  return (
    <>
      <div className="page-heading">

        <div>

          <p className="eyebrow">
            EVENT CONSUMER
          </p>

          <h2>
            Notifications
          </h2>

          <p>
            Order events consumed from Apache Kafka.
          </p>

        </div>

        <div className="live-label large-live">

          <Radio size={15} />

          KAFKA LIVE

        </div>

      </div>

      <section className="panel full-panel">

        <div className="panel-header">

          <div>

            <p className="panel-kicker">
              TOPIC: ORDERS
            </p>

            <h3>
              Recent Events
            </h3>

          </div>

        </div>

        <div className="notification-list">

          {[...orders]
            .reverse()
            .map((order) => (

              <div
                className="notification-row"
                key={order.id}
              >

                <div className="notification-icon">
                  <Bell size={17} />
                </div>

                <div className="notification-message">

                  <strong>
                    OrderCreated
                  </strong>

                  <p>
                    Order #
                    {String(order.id).padStart(
                      4,
                      "0"
                    )}{" "}
                    created for{" "}
                    {order.productId}
                  </p>

                </div>

                <span className="status-badge">

                  <CircleDot size={11} />

                  CONSUMED

                </span>

              </div>

            ))}

        </div>

      </section>

      <Footer />

    </>
  );
}

/* =========================================================
   SERVICES PAGE
========================================================= */

function ServicesPage({ services }) {
  return (
    <>
      <div className="page-heading">

        <div>

          <p className="eyebrow">
            MICROSERVICE ARCHITECTURE
          </p>

          <h2>
            Services
          </h2>

          <p>
            ShopStream platform components and
            communication technologies.
          </p>

        </div>

        <div className="online-pill">

          <span />

          6 Services Online

        </div>

      </div>

      <div className="services-page-grid">

        {services.map(
          ([name, technology, port]) => (

            <div
              className="service-card"
              key={name}
            >

              <div className="service-card-top">

                <div className="service-big-icon">
                  <Server size={20} />
                </div>

                <span className="service-online">

                  <i />

                  ONLINE

                </span>

              </div>

              <h3>
                {name}
              </h3>

              <p>
                {technology}
              </p>

              <div className="service-card-footer">

                <span>
                  PORT
                </span>

                <strong>
                  {port}
                </strong>

              </div>

            </div>

          )
        )}

      </div>

      <Footer />

    </>
  );
}

/* =========================================================
   ORDER TABLE
========================================================= */

function OrderTable({
  orders,
  emptyMessage = "No orders available.",
}) {
  if (orders.length === 0) {
    return (
      <div className="empty-state">

        <ShoppingCart size={25} />

        <p>
          {emptyMessage}
        </p>

      </div>
    );
  }

  return (
    <div className="table-wrapper">

      <table>

        <thead>

          <tr>

            <th>
              ORDER
            </th>

            <th>
              PRODUCT
            </th>

            <th>
              QUANTITY
            </th>

            <th>
              STATUS
            </th>

          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (

            <tr key={order.id}>

              <td>

                <span className="order-id">
                  #{String(order.id).padStart(
                    4,
                    "0"
                  )}
                </span>

              </td>

              <td>

                <div className="product-cell">

                  <div className="product-icon">
                    <Package size={16} />
                  </div>

                  <span>
                    {order.productId}
                  </span>

                </div>

              </td>

              <td>
                {order.quantity}
              </td>

              <td>

                <span className="status-badge">

                  <CircleDot size={11} />

                  {order.status}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   SERVICE LIST
========================================================= */

function ServiceList({ services }) {
  return (
    <div className="service-list">

      {services.map(
        ([name, technology, port]) => (

          <div
            className="service-row"
            key={name}
          >

            <div className="service-info">

              <div className="service-icon">
                <Server size={16} />
              </div>

              <div>

                <strong>
                  {name}
                </strong>

                <span>
                  {technology}
                </span>

              </div>

            </div>

            <div className="service-meta">

              <span>
                :{port}
              </span>

              <i />

            </div>

          </div>

        )
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  detail,
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span className="stat-live">

          <i />

          LIVE

        </span>

      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>

      <div className="stat-detail">
        {detail}
      </div>

    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer>

      <span>
        ShopStream
      </span>

      <span>
        Event-Driven E-Commerce Platform
      </span>

      <span>
        Built with Microservices
      </span>

    </footer>
  );
}

export default App;