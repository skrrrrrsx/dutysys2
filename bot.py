import discord
from discord.ext import commands
from discord import app_commands
import asyncio
import logging
from config import TOKEN, LOG_CHANNEL_ID
from database import Database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("DutyBot")

intents = discord.Intents.default()
intents.members = True

class DutyBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
        self.db = Database()

    async def setup_hook(self):
        await self.load_extension("cogs.duty")
        await self.tree.sync()
        logger.info("Slash commands synced.")

    async def on_ready(self):
        logger.info(f"Logged in as {self.user} (ID: {self.user.id})")
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="duty logs"
            )
        )

bot = DutyBot()

if __name__ == "__main__":
    bot.run(TOKEN)
