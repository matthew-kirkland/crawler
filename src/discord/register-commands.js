import { SlashCommandBuilder } from 'discord.js';
import { REST, Routes } from 'discord.js'
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  {
    name: 'subscribe',
    description: 'Receive arbitrage event announcements',
  },
  {
    name: 'unsubscribe',
    description: 'No longer receive event announcements',
  },
];

const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );
})();
