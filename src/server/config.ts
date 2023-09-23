export class AppConfig {
    databaseHost: string = 'localhost';
    databasePort: number = 5432;
    databaseName: string = 'postgres';
    databaseUser: string = 'postgres';
    databasePassword: string = '';

    algoliaAppId: string = 'K2EE7TWRCB';
    algoliaApiKey!: string;
    openaiApiKey: string = '';
    discordToken: string = '';
    discordChannel: string = '1154848447116091494';
    baseUrl: string = 'http://localhost:8080';
}
