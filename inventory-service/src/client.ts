import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(__dirname, "../proto/inventory.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const inventoryProto = grpc.loadPackageDefinition(
  packageDefinition
) as any;

const client = new inventoryProto.inventory.InventoryService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

client.CheckStock(
  {
    product_id: "LAPTOP-001",
    quantity: 2,
  },
  (error: any, response: any) => {
    if (error) {
      console.error("gRPC Error:", error);
      return;
    }

    console.log("gRPC Response:");
    console.log(response);
  }
);