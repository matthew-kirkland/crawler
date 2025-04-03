import express from 'express';
import { Client, GatewayIntentBits, EmbedBuilder, Guild } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(port, () => console.log(`Web server running on port ${port}`));

const announcementRoleId = '1357113895851921573';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.login(process.env.DISCORD_TOKEN);

/**
 * Adds or removes the event announcement role from the user
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const role = interaction.guild.roles.cache.get(announcementRoleId);
  if (interaction.commandName == 'subscribe') {
    await interaction.member.roles.add(role);
    interaction.reply('Subscribed to event announcements');
  } else if (interaction.commandName == 'unsubscribe') {
    await interaction.member.roles.remove(role);
    interaction.reply('Unsubscribed from event announcements');
  }
});

/**
 * Sends an embedded message to the discord channel
 * @param {string} message the main body of the message
 */
export async function sendNotif(message) {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  const embed = new EmbedBuilder()
    .setTitle('Arbitrage Event Found')
    .setDescription(message)
    .setFooter(
      {
        text: 'To unsubscribe from these notifications, use the /unsubscribe command',
      }
    )

  channel.send({ embeds: [embed] });
}