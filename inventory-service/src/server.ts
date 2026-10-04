import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(
  __dirname,
  "../proto/inventory.proto"
);

const packageDefinition =
  protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

const inventoryProto =
  grpc.loadPackageDefinition(
    packageDefinition
  ) as any;


/*
 * INVENTORY STOCK
 */

const stock: Record<string, number> = {
  "LAPTOP-001": 10,
  "PHONE-001": 20,
  "MOUSE-001": 50,
  "KEYBOARD-001": 30,
  "MONITOR-001": 15,
  "HEADPHONE-001": 40,
  "TABLET-001": 12,
  "CAMERA-001": 8,
};
function getCategory(productId: string): string {
  const categories: Record<string, string> = {
    "LAPTOP-001": "Laptop",
    "PHONE-001": "Smartphone",
    "MOUSE-001": "Accessories",
    "KEYBOARD-001": "Keyboard",
    "MONITOR-001": "Monitor",
    "HEADPHONE-001": "Audio",
    "TABLET-001": "Tablet",
    "CAMERA-001": "Camera",
  };

  return categories[productId] || "Other";
}

/*
 * CHECK AND RESERVE STOCK
 */

function checkStock(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
): void {

  const {
    product_id,
    quantity,
  } = call.request;

  const availableStock =
    stock[product_id] ?? 0;


  /*
   * Check if enough stock is available
   */

  if (availableStock >= quantity) {

    const remainingStock =
      availableStock - quantity;


    /*
     * Reduce inventory stock
     */

    stock[product_id] =
      remainingStock;


    callback(null, {

      available: true,

      remaining_stock:
        remainingStock,

      message:
        "Stock reserved successfully",

    });

  } else {

    callback(null, {

      available: false,

      remaining_stock:
        availableStock,

      message:
        "Insufficient stock",

    });

  }
}


/*
 * gRPC SERVER
 */

const server =
  new grpc.Server();


server.addService(
  inventoryProto.inventory.InventoryService.service,
  {
    CheckStock: checkStock,

    GetInventory: (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ): void => {

      const items = Object.entries(stock).map(
        ([product_id, stock]) => ({
          product_id,
          category: getCategory(product_id),
          stock,
          status:
            stock > 0
              ? "Available"
              : "Out of Stock",
        })
      );

      callback(null, {
        items,
      });
    },
  }
);


/*
 * START SERVER
 */

server.bindAsync(
  "0.0.0.0:50051",

  grpc.ServerCredentials
    .createInsecure(),

  (error, port) => {

    if (error) {

      console.error(
        "gRPC server failed:",
        error
      );

      return;
    }

    console.log(
      `Inventory gRPC Service running on port ${port}`
    );

  }
);