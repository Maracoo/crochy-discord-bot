const { ApplicationCommandOptionType } = require("discord.js");
const Pattern = require("../../models/Pattern");
const Basket = require("../../models/Basket");

module.exports = {
    name: 'remove',
    description: 'Remove a pattern from the basket.',
    // deleted: true,
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
            name: 'pattern',
            description: 'The pattern to remove.',
            type: ApplicationCommandOptionType.String,
            required: true
        },
    ],

    callback: async (client, interaction) => {
        try {
            const basket = await Basket.findOne({ guildId: interaction.guildId }) ||
                await Basket.findOne({ userId: interaction.user.id });
            if (!basket || interaction.guildId !== basket.guildId) {
                interaction.reply({
                    content: 'Error: No basket registered. Please register a basket first.',
                });
                return;
            } else {
                const patternName = interaction.options.getString('pattern');
                const pattern = await Pattern.findOne({ name: patternName, basketId: basket._id });
                if (!pattern) {
                    interaction.reply({ content: `Pattern "${patternName}" not found in basket.` });
                    return;
                } else {
                    if (basket.currentPattern) {
                        if (basket.currentPattern.equals(pattern._id)) {
                            basket.currentPattern = null;
                            basket.isRecording = false;
                            basket.channelId = null;
                        }
                    }
                    basket.patterns.pull(pattern._id);
                    await basket.save();
                    await Pattern.deleteOne({ _id: pattern._id });
                    interaction.reply({ content: `Pattern "${patternName}" removed from basket.` });
                }
            }
        } catch (error) {
            console.error(error);
            interaction.reply('Oh no! The basket fell off! Please try again.');
        }
    }
}