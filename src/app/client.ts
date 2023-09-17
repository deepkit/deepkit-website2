import { RpcWebSocketClient } from "@deepkit/rpc";
import type { MainController } from "@app/server/controller/main.controller";
import { Injectable } from "@angular/core";

@Injectable()
export class ControllerClient {
    main = this.client.controller<MainController>('/main');

    constructor(private client: RpcWebSocketClient) {
    }
}
