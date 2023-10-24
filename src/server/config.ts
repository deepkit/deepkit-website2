export class AppConfig {
    environment: 'prod' | 'dev' = 'dev';

    databaseHost: string = 'localhost';
    databasePort: number = 5433;
    databaseName: string = 'postgres';
    databaseUser: string = 'postgres';
    databasePassword: string = '';

    benchmarkSecret: string = 'notSet';

    algoliaAppId: string = 'K2EE7TWRCB';
    algoliaApiKey: string = '';

    openaiApiKey: string = '';

    //see https://platform.openai.com/account/rate-limits
    // see https://tiktokenizer.vercel.app/
    openaiModel: string = 'gpt-3.5-turbo-16k';

    discordToken: string = '';
    discordChannel: string = '1154848447116091494';
    baseUrl: string = 'http://localhost:8080';
}
