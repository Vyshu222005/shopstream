import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(__dirname, "../inventory.proto");

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
  process.env.INVENTORY_GRPC_URL || "localhost:50051",
  grpc.credentials.createInsecure()
);

export function checkStock(productId: string, quantity: number): Promise<any> {
  return new Promise((resolve, reject) => {
    client.CheckStock(
      {
        product_id: productId,
        quantity: quantity,
      },
      (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(response);
      }
    );
  });
}