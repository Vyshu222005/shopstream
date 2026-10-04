const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");

const {
  getInventory,
} = require("./inventory-client");

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

const app = express();

app.use(cors());
app.use(express.json());

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL ||
  "http://127.0.0.1:3001";

/*
 * Order Type
 */
const OrderType = new GraphQLObjectType({
  name: "Order",

  fields: {
    id: {
      type: GraphQLInt,
    },

    productId: {
      type: GraphQLString,
    },

    quantity: {
      type: GraphQLInt,
    },

    status: {
      type: GraphQLString,
    },
  },
});

/*
 * Inventory Type
 */
const InventoryItemType =
  new GraphQLObjectType({
    name: "InventoryItem",

    fields: {
      productId: {
        type: GraphQLString,
      },

      category: {
        type: GraphQLString,
      },

      stock: {
        type: GraphQLInt,
      },

      status: {
        type: GraphQLString,
      },
    },
  });

/*
 * Query
 */
const RootQuery = new GraphQLObjectType({
  name: "Query",

  fields: {
    /*
     * Get Orders
     */
    orders: {
      type: new GraphQLList(OrderType),

      resolve: async () => {
        const response = await fetch(
          `${ORDER_SERVICE_URL}/orders`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch orders"
          );
        }

        const orders =
          await response.json();

        return orders.map((order) => ({
          id: order.id,
          productId:
            order.product_id,
          quantity:
            order.quantity,
          status:
            order.status,
        }));
      },
    },

    /*
     * Get Inventory
     */
    inventory: {
      type: new GraphQLList(
        InventoryItemType
      ),

      resolve: async () => {
        const result =
          await getInventory();

        return result.items.map(
          (item) => ({
            productId:
              item.product_id,

            category:
              item.category,

            stock:
              item.stock,

            status:
              item.status,
          })
        );
      },
    },
  },
});

/*
 * Mutation
 */
const RootMutation =
  new GraphQLObjectType({
    name: "Mutation",

    fields: {
      createOrder: {
        type: OrderType,

        args: {
          productId: {
            type:
              new GraphQLNonNull(
                GraphQLString
              ),
          },

          quantity: {
            type:
              new GraphQLNonNull(
                GraphQLInt
              ),
          },
        },

        resolve: async (
          _,
          {
            productId,
            quantity,
          }
        ) => {
          const response =
            await fetch(
              `${ORDER_SERVICE_URL}/orders`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  productId,
                  quantity,
                }),
              }
            );

          const order =
            await response.json();

          if (!response.ok) {
            throw new Error(
              order.message ||
                "Failed to create order"
            );
          }

          return {
            id: order.id,

            productId:
              order.product_id,

            quantity:
              order.quantity,

            status:
              order.status,
          };
        },
      },
    },
  });

/*
 * GraphQL Schema
 */
const schema =
  new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
  });

/*
 * GraphQL Endpoint
 */
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

/*
 * Health Check
 */
app.get("/", (req, res) => {
  res.json({
    service:
      "ShopStream GraphQL API",

    status: "running",

    graphql:
      "/graphql",
  });
});

/*
 * Start Server
 */
const PORT = 4000;

app.listen(PORT, () => {
  console.log(
    `GraphQL API running on port ${PORT}`
  );
});