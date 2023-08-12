const eris = require("eris");
const client = require("../../../helpers/clientBuilder")
const { discord: { optionsPraser }, sleep } = require("../../../helpers/utils") // JS moment

const axios = require("axios").default

const Constants = eris.Constants;

module.exports = {
    alwaysUpdate: true,
    command: {
        name: "ai",
        description: "AI stuff",
        // type: Constants.ApplicationCommandTypes.CHAT_INPUT,
        options: [ //An array of Chat Input options https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
            {
                name: "texttoimage",
                description: "Text to image AI",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "prompt", //The name of the option
                        description: "prompt to use",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: true
                    },
                    {
                        name: "model", //The name of the option
                        description: "model to use",
                        type: Constants.ApplicationCommandOptionTypes.STRING, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: true,
                        choices: [
                            {
                                name: "andite/anything-v4.0",
                                value: "andite/anything-v4.0"
                            },
                            {
                                name: "gsdf/Counterfeit-V2.5",
                                value: "gsdf/Counterfeit-V2.5"
                            }
                        ]
                    },
                    {
                        name: "steps", //The name of the option
                        description: "Steps to use",
                        type: Constants.ApplicationCommandOptionTypes.INTEGER, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    },
                    {
                        name: "images", //The name of the option
                        description: "images to make",
                        type: Constants.ApplicationCommandOptionTypes.INTEGER, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    },
                    {
                        name: "private", //The name of the option
                        description: "Private mode (won't be public)",
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN, //This is the type of string, see the types here https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
                        required: false
                    },
                ]
            },
        ]
    },

    async loop(interaction, jobID, imageCount){
        const statusResponse = await axios.post("http://192.168.4.50:3504/api/status", {
            type: 0,
            jobID: jobID
        })
        let data = statusResponse.data
        console.log(data)
        if (data.status == 3) {
            var files = []
            for (let index = 0; index < imageCount; index++) {
                const response = await axios.get(`http://192.168.4.50:3504/image/${jobID}/${index}`, {responseType: "arraybuffer"})
                // console.log(response.data)
                let img = Buffer.from(response.data, "binary")
                files.push({ file: img, name: `${index}.ai.airplanegobrr.xyz.png`})
            }
            
            await interaction.editOriginalMessage("Done!", files)
            console.log("Done")
        } else {
            await interaction.editOriginalMessage(`Server got job ${"```"}${jobID}${"```"} Position: ${data.position} Prog: ${data.progress}`)
            await sleep(1000)
            await this.loop(interaction, jobID, imageCount)
        }
    },

    /**
     * 
     * @param {eris.CommandInteraction} interaction 
     * @param {client} bot 
     */
    async execute(interaction, bot) {
        const options = await optionsPraser(interaction.data.options)
        const command = Object.keys(options)[0]

        switch (command) {
            case "texttoimage": {
                try {
                    if (!!options[command].private) await interaction.createMessage({content: "Thinking...", flags: 64}); else await interaction.createMessage("Thinking...");
                    var steps = options[command].steps ?? 50
                    var imgs = options[command].images ?? 1
                    if (steps > 50 && interaction.member.id != "250029754076495874") steps = 50
                    if (imgs > 1 && interaction.member.id != "250029754076495874") imgs = 1
                    const response = await axios.post("http://192.168.4.50:3504/api/create", {
                        prompt: options[command].prompt,
                        negprompt: "EasyNegative",
                        model: options[command].model,
                        playlist: "apgb-api",
                        steps: steps,
                        imgs: imgs,
                        width: 512,
                        height: 512,
                        token: "72e41fca-f10b-44f9-9cfc-9ade0bc370b5"
                    })
                    let data = response.data
                    console.log(response.data)

                    if (data.status && data.status == 0) {
                        await interaction.editOriginalMessage(`Server got job ${"```"}${data.id}${"```"} Position: ${"N/A"} Prog: ${"N/A"}`)
                    }

                    await this.loop(interaction, response.data.id, imgs)
                } catch (e) {
                    console.log(e)
                    interaction.editOriginalMessage(`FUCK ${e.message}`)
                }
            }
        }
    }
}