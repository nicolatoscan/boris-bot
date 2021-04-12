import { Telegraf, Context } from "telegraf"
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config();

const imageIndex = JSON.parse(fs.readFileSync('../index.json', 'utf-8'))

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''

const bot: Telegraf<Context> = new Telegraf(BOT_TOKEN)

bot.command('ping', ctx => ctx.reply('Pong'));

bot.on('text', async ctx => {
    const words = ctx.message.text.toLowerCase().split(' ')

    // const results = [...new Set(words.map(w => imageIndex[w]).filter(x => x).flat(1))]
    const keys = Object.keys(imageIndex).filter(k => words.some(w => k.includes(w)))
    const results = [...new Set(
        keys.map(w => imageIndex[w])
            .filter(x => x)
            .flat(1)
        )]

    if (results.length === 0) {
        ctx.reply('No image found');
    } else {
        ctx.reply(`Found ${results.length} images with: ${keys.join(" - ")}`)

        const chunk = 10;
        for (let i = 0; i < results.length; i += chunk) {
            try {
                await ctx.replyWithMediaGroup(results.slice(i, i + 10).map(p => ({
                    type: 'photo',
                    media: {
                        source: `../data/jpg/${p}`
                    }
                })));
            } catch {
                console.log('Error sending photos');
                return;
            }
        }
        console.log(`Sent ${results.length} photos `);
        

    }
});

bot.launch()
console.log(`Bot started`);
