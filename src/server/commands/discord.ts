import { AnyThreadChannel, ChannelType, Client, GatewayIntentBits } from 'discord.js';
import { Questions } from "@app/server/questions";
import { AppConfig } from "@app/server/config";
import { Logger } from "@deepkit/logger";
import { CommunityMessage, CommunityThread } from "@app/common/models";
import { Database } from "@deepkit/orm";

export async function registerBot(
    event: any,
    token: AppConfig['discordToken'],
    questions: Questions,
    logger: Logger,
    database: Database,
    client: Client,
) {
    logger = logger.scoped('Discord');

    logger.log('Discord bot starting');
    await client.login(token);
    let botUserId = '';

    client.on('error', (error) => {
        logger.error('Discord error', error);
    });

    client.on('ready', () => {
        botUserId = client.user!.id;
        logger.log(`Discord logged in as ${client.user!.tag} ${client.user!.id}!`);
    });

    client.on('messageCreate', async (message) => {
        if (!botUserId) return;

        const mentioned = message.mentions.users.has(botUserId);
        if (message.author.id === botUserId) return;
        let channelName = '';

        let thread: AnyThreadChannel | undefined = undefined;
        if (message.channel.type === ChannelType.GuildPublicThread || message.channel.type === ChannelType.GuildPrivateThread) {
            thread = message.channel;
        } else if (message.channel.type === ChannelType.GuildText) {
            channelName = message.channel.name;
        }

        let shouldAnswer = false;

        if (thread && thread.ownerId === botUserId) {
            shouldAnswer = true;
        }

        if (mentioned) {
            shouldAnswer = true;
        }

        logger.log('discord message', channelName, { mentioned, shouldAnswer }, message);
        if (!shouldAnswer) return;

        const prompt = message.content.replace(`<@!${botUserId}>`, '@DeepBot').trim();

        let question = new CommunityThread(message.author.id, message.author.displayName);
        question.discordMessageId = message.id;

        if (message.channel.type === ChannelType.GuildText) {
            question.discordChannelId = message.channel.id;
        }

        if (thread) {
            question = await database.query(CommunityThread).filter({ discordThreadId: thread.id }).findOneOrUndefined() ?? question;
            question.discordThreadId = thread.id;
        }

        await questions.ask(question, new CommunityMessage(question, message.author.id, message.author.displayName, prompt));

        //todo: save into database
        //todo: add discord login and abstract everything so we can do the same stuff in Community Q&A page on the website
        // stuff created from the website should be visible in discord too.

        // if in thread:
        //1. find CommunityQuestion
        //2. load all answers
        //3. add new answer

        //if not in thread:
        //1. create new CommunityQuestion
        //2. add new answer
    });

}
