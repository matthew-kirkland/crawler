import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.login(process.env.DISCORD_TOKEN);

/**
 * Sends an embedded message to the discord channel
 * @param {string} message the main body of the message
 */
export async function sendNotif(message) {
  const channel = await client.channels.fetch('1356716460394676355');
  const embed = new EmbedBuilder()
    .setTitle('🗣️💯‼️🔥 Arbitrage Event Found 😳😳😳')
    .setDescription(message)

  channel.send({ embeds: [embed] });
}