const wa = require('@open-wa/wa-automate');
var request = require('request');
const fs = require('fs-extra');
const {exec} = require('child_process')
const {menu} = require('./lib/utils');
const { stat } = require('fs');
// var flirts = require('./flirts');
const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
wa.create().then(client => start(client))

function start(client){
    client.onMessage(async message => {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        const groupId = isGroupMsg ? chat.groupMetadata.id : "";
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId): "";
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const botNumber = ""; // Specify your botNumber here
        const botOwner = ""; //Specify bot owner number here
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes() : false
        const { name, formattedTitle } = chat
        let { body } = message
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''

        

        if(command === '!say'){
            // if(message.isGroupMsg){
                const ttsEn = require('node-gtts')('hi')
                const dataText = body.slice(4)
                //console.log ('dataText:', dataText);
                try {
                    if (dataText === '') return client.reply(from, 'pahale toh aap decide kar lo kahana kya chaahate ho!', id)
                    if (dataText.length > 200) return client.reply(from, 'Bot hai toh itna bada message translate karwaoge wae wae?', id)
                    if(dataText.includes('bot') || dataText.includes('GT') || dataText.includes("hii") || dataText.includes("Gaurav") || dataText.includes("gaurav")){
                        ttsEn.save('./media/tts/resEn.mp3', "wae ☺️!", function () {
                            return client.sendPtt(from, './media/tts/resEn.mp3', id)
                        })
                    } else{
                        ttsEn.save('./media/tts/resEn.mp3', dataText, function () {
                            client.sendPtt(from, './media/tts/resEn.mp3', id)
                        })
                    }
                } catch (error) {
                    console.error(error)
                }
               
            // }  
        }
        if(command === 'yelo'){
            client.sendText(from,menu)
        }
        if(command === '!flirt'){
            var possible =  flirts.phrases[Math.floor(Math.random()*flirts.phrases.length)];

            while (possible.length >  119){
                
                possible =  flirts.phrases[Math.floor(Math.random()*flirts.phrases.length)];
            }
            client.reply(from,possible,id);
        }
        if(command === '!admins'){
            try {
                
            //console.log("groupAdmins", groupAdmins);
            if (isGroupMsg) client.reply(from, 'These are your group admins', id)
            let temp = ''
            const Owner_ = chat.groupMetadata.owner
            temp+=`Owner of the group is: @${Owner_}\n`
            for (let admin of groupAdmins) {
                
                temp += `➸ @${admin.replace(/@c.us/g, '')}\n` 
            }
            return await client.sendTextWithMentions(from, temp)
            } catch (error) {
                console.error(error);
            }
            
        }
        if(command === '!sticker') {

            try {
                if(isMedia && type == 'image'){
                    const mediaData = await wa.decryptMedia(message, uaOverride)
                    const imgbase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    await client.sendImageAsSticker(from, imgbase64)
                    client.reply(from, 'Bana diya sticker ab mere sath wae wae karo ☺️!', id)
                }
                else if(quotedMsg && quotedMsg.type == 'image'){
                    const mediaData = await wa.decryptMedia(quotedMsg, uaOverride)
                    const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                    await client.sendImageAsSticker(from, imageBase64)
                    client.reply(from, 'Bana diya sticker ab wae wae karo ☺️!', id)
                }
                else{
                    client.reply(from, "phale tho aap Sahi command type karlo ☺️!")
                }
            } catch (error) {
                
            } 
        }

        if(command === '!animated') {

            try {
                if (isMedia) {
                    console.log("mimeType:",mimetype)
                    if ((mimetype === 'video/mp4' && message.duration < 5) || (mimetype === 'image/gif' && message.duration < 5)) {
                        const mediaData = await wa.decryptMedia(message, uaOverride)
                        const filename = `./media/media.${mimetype.split('/')[1]}`
                        await fs.writeFileSync(filename, mediaData)
                        try{
                            await exec(`gify ${filename} ./media/output.gif --fps=15 --scale=350:350`, async function (error, stdout, stderr) {
                                if(!error){
                                    const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
                                    await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                                    client.reply(from, 'Woosh! Your animated sticker is here!', id)
                                }
                                
                                
                            })
                        }catch (err){
                            
                            
                        }
                        
                    } 
                    
                    
                        
                        
                        
                    
                }
                else if((quotedMsg && quotedMsg.mimetype == 'video/mp4' && quotedMsg.duration<10) || (quotedMsg && quotedMsg.mimetype == 'image/gif' && quotedMsg.duration <10)){
                    const message = quotedMsg;
                    
                    const mimeType = quotedMsg.mimetype
                    console.log("mimeType:",mimeType)
                    const mediaData = await wa.decryptMedia(message, uaOverride)
                        const filename = `./media/media.${mimeType.split('/')[1]}`
                        await fs.writeFileSync(filename, mediaData)
                        try{
                            await exec(`gify ${filename} ./media/output.gif --fps=15 --scale=350:350`, async function (error, stdout, stderr) {
                                if(!error){
                                    const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
                                    await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                                    client.reply(from, 'Woosh! Your animated sticker is here!', id)
                                }
                                else {
                                    const filename = `./media/funnystickers/thakgayahun.png`
                                    const stickerBase64 = await fs.readFileSync(filename, {encoding:"base64"})
                                    await client.sendImageAsSticker(from,`data:image/png;base64,${stickerBase64.toString('base64')}`)
                                    //console.error(error)
                                    
                                }
                                
                            })
                        }catch (err){
                            const filename = `./media/funnystickers/thakgayahun.png`
                            const stickerBase64 = await fs.readFileSync(filename, {encoding:"base64"})
                            await client.sendImageAsSticker(from,`data:image/png;base64,${stickerBase64.toString('base64')}`)
                            console.error(err)
                            
                        }

                }
                
            } catch (error) {
                const filename = `./media/funnystickers/thakgayahun.png`
                const stickerBase64 = await fs.readFileSync(filename, {encoding:"base64"})
                await client.sendImageAsSticker(from,`data:image/png;base64,${stickerBase64.toString('base64')}`)
                //console.error(error);
                
            }
            
            
        }
        if(command === "!grouplink"){
            try {
                if(isGroupMsg){
                    let temp = "";
                    let dataText = body.split(" ")[1]
                    if(!dataText || !dataText.includes("@")) return client.reply(from, "Group link :- Botera.ml/𝐁𝐨𝐭👀🔥👻𝐄𝐑𝐀",id)
                    let flirtLines = ["Group link :- Botera.ml/𝐁𝐨𝐭👀🔥👻𝐄𝐑𝐀",
                    "Group link :- https://chat.whatsapp.com/J99qEjAYJpyItA4ZDBQdIf",]
                    const flirt = flirtLines[Math.floor(Math.random() * flirtLines.length)]
                    temp+=`Hey ${dataText}, \n${flirt}`
                    client.sendTextWithMentions(from, temp)
    
                }else{
                    client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {
                console.log(selectedAudio)
                console.error(error)
            }
        }
        
        if(command === "!everyone"){
            try {
                if(!isGroupAdmins) return client.reply(from, "Bot ki shakti ka galat istemaal?\nOnly *mrs.v, puchku, almari, Stree, Fuggi, Arshi, mrsun's, krpto,* can do that ☺️!", id)
                if(isGroupMsg){
                   const groupMembers = await client.getGroupMembers(groupId)
                   const dataText = body.slice(9)
                   if(dataText){
                   let temp ='';
                   for (let index = 0; index < groupMembers.length; index++) {
                       temp+=`@${groupMembers[index].id.replace(/@c.us/g, '')}\t`
                   }
                   temp+=`\n${dataText}`;
                   await client.sendTextWithMentions(from, temp);
                    }
                    else{
                        client.reply(from, "Arey kehna kya chahte ho", id)
                    }
                }
                else{
                   client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {               console.error(error); 
            }  
        }

        if(command === "!hey"){
            try {
                if(isGroupMsg){
                    let temp = "";
                    let dataText = body.split(" ")[1]
                    if(!dataText || !dataText.includes("@")) return client.reply(from, "wae wae!",id)
                    let flirtLines = ["Behan chor🙂",
                    "Ek chamat me heroine ban jayegi",
                    "Gaal sujaa dungi Haath gila karke",
                    "Konse gaal pe rahpat khaegi bc",
                    "You gaddrar, I HATE you",
                    "q Bhai q dukhti rakt par hath q rakh re",
                    "Wae wae ki kashti me beta masti nahi!",
                    "Muh na fhulaooo ab",
                    "Ek chamat",
                    "dhinchak pooja ki mausi",
                    "Nimboo chatto",]
                    const flirt = flirtLines[Math.floor(Math.random() * flirtLines.length)]
                    temp+=`Hey ${dataText}, \n${flirt}`
                    client.sendTextWithMentions(from, temp)
    
                }else{
                    client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {
                console.log(selectedAudio)
                console.error(error)
            }
        }
        if(command === "!truth&dare"){
            try {
                if(isGroupMsg){
                    let temp = "";
                    let dataText = body.split(" ")[1]
                    if(!dataText || !dataText.includes("@roll")) return client.reply(from, "wae wae!",id)
                    let flirtLines = ["Manasvi 🍾 truth",
                    "Fuggi 🍾 truth",
                    "mr suns 🍾 dare",
                    "Arshi 🍾 truth",
                    "Fuggi 🍾 dare",
                    "Angelina 🍾 dare",
                    "Krpto 🍾 truth",
                    "Amira 🍾 dare",
                    "Manasvi 🍾 dare",
                    "Riddhi 🍾 dare",
                    "Krpto 🍾 dare",
                    "Angelina 🍾 truth",
                    "Arshi 🍾 dare",
                    "mr suns 🍾 truth",
                    "Riddhi 🍾 dare",
                    "Amira 🍾 truth",]
                    const flirt = flirtLines[Math.floor(Math.random() * flirtLines.length)]
                    temp+=`*Truth&dare🍾* ${dataText}, \n${flirt}`
                    client.sendTextWithMentions(from, temp)
    
                }else{
                    client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {
                console.log(selectedAudio)
                console.error(error)
            }
        }
        if(command === "!s4u"){
        
            try {
                let dataText = body.split(" ")[1]
                //console.log(dataText)
                if(isGroupMsg){
                    if(dataText.trim().includes(`@${botNumber.replace(/@c.us/g, '')}`)){
                    }    
                      
                    const pathList = ["ae_ji_gaali_de_raha.m4a","roti_chawal.m4a","rowdy_abuse.m4a","chal_bsdk.m4a","pramod_dubey_maa_chod.m4a","a.m4a","s.m4a","d.m4a","f.m4a","g.m4a","h.m4a","j.m4a","k.m4a","l.m4a","q.m4a","w.m4a",]
                    let selectedAudio = pathList[Math.floor(Math.random() * pathList.length)]
                    
                    const groupMembers = await client.getGroupMembers(groupId)
                    groupMembers.filter(function(item){
                        // Remove the bot number 
                        return item.id !== botNumber
                    })
                    let selectedMember = groupMembers[Math.floor(Math.random() * groupMembers.length)]
                    
                    const audioId = client.sendFile(from,`./media/abuseAudios/${selectedAudio}`,"gaali.m4a","Yeh lo but  kud bhejo!",waitForId=true)
                    audioId.then((audioIdval)=>{
                        
                        if(!dataText || !dataText.includes("") || dataText === undefined) return client.sendTextWithMentions(from,`@${selectedMember.id.replace(/@c.us/g,'')} Yeh lo!`)
                        client.sendTextWithMentions(from,`${dataText} this is only for uh...❤️!`)
                    })
                    // console.log("audioId", audioId)
                }else{
                    client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {
                console.log(selectedAudio)
                console.error(error)
            }
        }
        
        if(command === "!s4s"){
        
            try {
                let dataText = body.split(" ")[1]
                //console.log(dataText)
                if(isGroupMsg){
                    if(dataText.trim().includes(`@${botNumber.replace(/@c.us/g, '')}`)){
                    }    
                      
                    const pathList = ["kammua.m4a","kammub.m4a",]
                    let selectedAudio = pathList[Math.floor(Math.random() * pathList.length)]
    
                    const groupMembers = await client.getGroupMembers(groupId)
                    groupMembers.filter(function(item){
                        // Remove the bot number 
                        return item.id !== botNumber
                    })
                    let selectedMember = groupMembers[Math.floor(Math.random() * groupMembers.length)]
                    
                    const audioId = client.sendFile(from,`./media/kammu/${selectedAudio}`,"gaali.m4a","Yeh lo but  kud bhejo!",waitForId=true)
                    audioId.then((audioIdval)=>{
                        
                        if(!dataText || !dataText.includes("") || dataText === undefined) return client.sendTextWithMentions(from,`@${selectedMember.id.replace(/@c.us/g,'')} Yeh lo!`)
                        client.sendTextWithMentions(from,`${dataText} this is only for uh...❤️!`)
                    })
                    // console.log("audioId", audioId)
                }else{
                    client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {
                console.log(selectedAudio)
                console.error(error)
            }
        }
        if(command === "!songuh..."){
        
            try {
                let dataText = body.split(" ")[1]
                //console.log(dataText)
                if(isGroupMsg){
                    if(dataText.trim().includes(`@${botNumber.replace(/@c.us/g, '')}`)){
                    }    
                      
                    const pathList = ["GulabiAakhenjoTeriDekhi.mp3","MainChali.mp3","YehLadkaHayeAllahKaisaHaiDeewanaItnaMushkilHaiTaubaIskoSamjhaana.mp3","WohLadkahaikahanSamnyekonaya.mp3","MainChali2.O.mp3","MereSamneWaliKhidkiMein.mp3",]
                    let selectedAudio = pathList[Math.floor(Math.random() * pathList.length)]
    
                    const groupMembers = await client.getGroupMembers(groupId)
                    groupMembers.filter(function(item){
                        // Remove the bot number 
                        return item.id !== botNumber
                    })
                    let selectedMember = groupMembers[Math.floor(Math.random() * groupMembers.length)]
                    
                    const audioId = client.sendFile(from,`./media/song/${selectedAudio}`,"gaali.m4a","Yeh lo but  kud bhejo!",waitForId=true)
                    audioId.then((audioIdval)=>{
                        
                        if(!dataText || !dataText.includes("") || dataText === undefined) return client.sendTextWithMentions(from,`@${selectedMember.id.replace(/@c.us/g,'')} Yeh lo!`)
                        client.sendTextWithMentions(from,`${dataText} this is only for uh...❤️!`)
                    })
                    // console.log("audioId", audioId)
                }else{
                    client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {
                console.log(selectedAudio)
                console.error(error)
            }
        }
        if(command === "!compliment"){
            try{
                let temp = "";
                request('https://complimentr.com/api', function (error, response, body) {
                res = JSON.parse(response.body);
                
                temp+=`@${sender.id.replace(/@c.us/g, '')}\n${res['compliment']}`
                client.sendTextWithMentions(from,temp)
            });
            } catch (error){
                console.error(error);
            }
        }
        if(command === "!flirtwith"){
            try {
                if(isGroupMsg){
                    let temp = "";
                    let dataText = body.split(" ")[1]
                    if(!dataText || !dataText.includes("@")) return client.reply(from, "Kiske saath flirt karu!",id)
                    let flirtLines = ["Can I borrow a kiss? I promise I'll give it back",
                    "Can I take your picture to prove to all my friends that angels do exist?",
                    "You're the only girl I love now... but in ten years, I'll love another girl. She'll call you 'Mommy.'",
                    "I will stop loving you when an apple grows from a mango tree on the 30th of February",
                    "I don't have a library card, but do you mind if I check you out",
                    "Do you have a map? I'm getting lost in your eyes",
                    "I'm not a photographer, but I can picture me and you together",
                    "Can I set my Heartstone at your place tonight?",
                    "If I could rearrange the alphabet, I’d put ‘U’ and ‘I’ together",
                    "I must be a snowflake, because I've fallen for you.",
                    "I’m learning about important dates in history. Wanna be one of them?",
                    "You must be tired because you've been running through my mind all night.",
                    "I must be in a museum, because you truly are a work of art.",
                    "They say Disneyland is the happiest place on earth. Well apparently, no one has ever been standing next to you.",
                    "Is your name Google? Because you have everything I’ve been searching for.",
                    "I’m no mathematician, but I’m pretty good with numbers. Tell you what, give me yours and watch what I can do with it",
                    "Hello. Cupid called. He wants to tell you that he needs my heart back",
                    "You know what you would look really beautiful in? My arms.",
                    "Are you an electrician? Because you’re definitely lighting up my day/night!",
                    "I’m really glad I just bought life insurance, because when I saw you, my heart stopped.",
                    "Would you mind giving me a pinch? You’re so cute, I must be dreaming",
                    "If I were a cat, I’d spend all nine of my lives with you",
                    "I’m not currently an organ donor, but I’d be happy to give you my heart",
                    "I can’t tell if that was an earthquake, or if you just seriously rocked my world"]
                    const flirt = flirtLines[Math.floor(Math.random() * flirtLines.length)]
                    temp+=`Hey ${dataText}, \n${flirt}`
                    client.sendTextWithMentions(from, temp)
                    
                }
                else{
                    client.reply(from, "Group me hi chalega",id)
                }
            } catch (error) {
                console.error(error)
            }
            
            
        }
        
    })
}
