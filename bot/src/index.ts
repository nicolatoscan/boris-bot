import { Telegraf, Context } from "telegraf"
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config();

function getImagesPath(query: string): { results: string[], keys: string[] } {
    console.log(query);
    
    if (query.length === 0) {
        console.log('All empty');
        
        return {
            results: [ ...imageIndex['empty-words'] ],
            keys: []
        }
    }

    const words = query.split(' ')
    const keys = Object.keys(imageIndex).filter(k => words.some(w => k.includes(w)))
    const results = [...new Set(
        keys.map(w => imageIndex[w])
            .filter(x => x)
            .flat(1)
        )]
    return { results: results, keys: keys };
}

function getVideos(): { results: string[], keys: string[] } {
    return { results: [...imageIndex['videos']], keys: ['videos'] };
}

const imageIndex = JSON.parse(fs.readFileSync('../index.json', 'utf-8'))
const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const bot: Telegraf<Context> = new Telegraf(BOT_TOKEN)

bot.command('ping', ctx => ctx.reply('Pong'));

bot.on('text', async ctx => {
    console.log(`Chat search: ${ctx.message.text}`);
    const { results, keys } = getImagesPath(ctx.message.text.toLowerCase());

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

bot.on('inline_query', async (ctx) => {
    const q = ctx.inlineQuery.query.toLowerCase()
    console.log(`Inline search: ${q}`);
    
    const { results, keys } =  (q === 'video' || q === 'video2') ? getVideos() : getImagesPath(q.length >= 3 ? q : '');
    
    if (q !== 'video' && q !== 'video2') {
        if (q.length < 3) {
            results.splice(0, 50 * q.length)
        }
        await ctx.answerInlineQuery(results.slice(0, 50).map(r => ({
                type: 'photo',
                id: r,
                thumb_url: `http://nicolatoscan.altervista.org/boris/${r}`,
                photo_url: `http://nicolatoscan.altervista.org/boris/${r}`
            })))
    } else {
        if (q === 'video2') {
            results.splice(0, 50)
        }
        ctx.answerInlineQuery(results.slice(0, 50).map(r => ({
            type: 'video',
            mime_type: 'video/mp4',
            id: r,
            thumb_url: `http://nicolatoscan.altervista.org/borismp4/${r}.jpg`,
            title: r,
            video_url: `http://nicolatoscan.altervista.org/borismp4/${r}`
        })));
    }
})


bot.launch()
console.log(`Bot started`);
