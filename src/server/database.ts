import { Database } from '@deepkit/orm';
import { MongoDatabaseAdapter } from "@deepkit/mongo";
import { CommunityMessage, CommunityThread } from "@app/common/models";
import { AppConfig } from "@app/server/config";

export class MainDatabase extends Database {
    constructor(databaseUrl: AppConfig['databaseUrl']) {
        super(
            new MongoDatabaseAdapter(databaseUrl),
            [CommunityThread, CommunityMessage]
        );
    }
}
