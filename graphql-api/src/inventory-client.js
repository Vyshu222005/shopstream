const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(
  __dirname,
  "./proto/inventory.proto"
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
  );

const client =
  new inventoryProto.inventory.InventoryService(
    process.env.INVENTORY_GRPC_URL ||
      "inventory-service:50051",
    grpc.credentials.createInsecure()
  );

function getInventory() {
  return new Promise((resolve, reject) => {
    client.GetInventory(
      {},
      (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(response);
      }
    );
  });
}

module.exports = {
  getInventory,
};