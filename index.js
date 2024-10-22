require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const Dare = require("./models/dare");
const Truth = require("./models/truth");
const express = require("express");
const app = express();
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
app.get("/", (req, res) => {
  res.send("Hello World");
});

const {
  SlashCommandBuilder,
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonComponent,
  ButtonStyle,
  blockQuote,
  bold,
  italic,
  quote,
  spoiler,
  strikethrough,
  underline,
  subtext,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const intentsBit = 2147748928;
const client = new Client({
  intents: GatewayIntentBits.Guilds,
});
const data = require("./data");

client.login(process.env.DISCORD_TOKEN);
console.log("Bot is running");

const { REST, Routes } = require("discord.js");
const { type } = require("os");

let games = {};

const commands = [
  {
    name: "truth",
    description: "Get a fun truth from custom and og hehehehe...",
  },
  {
    name: "truthcustom",
    description: "Get a fun truth from the custom pool hehehehe...",
  },
  {
    name: "truthog",
    description: "Get a fun truth from the og pool hehehehe...",
  },
  {
    name: "dare",
    description: "Get a fun dare hehehehe...",
  },
  {
    name: "darecustom",
    description: "Get a fun dare from the custom pool hehehehe...",
  },
  {
    name: "dareog",
    description: "Get a fun dare from the og pool hehehehe",
  },
  {
    name: "tod",
    description: "Get a fun truth or a fun dare from custom and og hehehehe...",
  },
  {
    name: "todcustom",
    description:
      "Get a fun truth or a fun dare from the custom pool hehehehe...",
  },
  {
    name: "todog",
    description: "Get a fun truth or a fun dare from the og pool hehehehe...",
  },
  {
    name: "add",
    description: "Add a truth or a dare to the bot",
    options: [
      {
        name: "type",
        description: "Select Truth or Dare",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "Truth",
            value: "truth",
          },
          {
            name: "Dare",
            value: "dare",
          },
        ],
      },
    ],
  },
  {
    name: "newgame",
    description: "Start a new game with rules and skips",
  },
  {
    name: "customdares",
    description: "Get a list of custom dares",
  },
  {
    name: "customtruths",
    description: "Get a list of custom truths",
  },
];

let customDares = [];
let customTruths = [];

async function connectToDB() {
  try {
    console.log(process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL || "");
    console.log("Connected to MongoDB");
    const truths = await Truth.find();
    const dares = await Dare.find();

    customTruths = truths.map((truth) => truth.question);
    customDares = dares.map((dare) => dare.question);
    console.log(customTruths);
    console.log(customDares);
  } catch (error) {
    console.error(error);
  }
}
connectToDB();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
async function refreshCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log(commands);

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
refreshCommands();

const truthBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Success)
  .setLabel("Truth")
  .setCustomId("truth");

const dareBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Danger)
  .setLabel("Dare")
  .setCustomId("dare");

const todBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Primary)
  .setLabel("Random")
  .setCustomId("tod");

const truthCustomBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Success)
  .setLabel("Custom Truth")
  .setCustomId("truthcustom");

const dareCustomBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Danger)
  .setLabel("Custom Dare")
  .setCustomId("darecustom");

const todCustomBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Primary)
  .setLabel("Custom Random")
  .setCustomId("todcustom");

const truthOgBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Success)
  .setLabel("OG Truth")
  .setCustomId("truthog");

const dareOgBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Danger)
  .setLabel("OG Dare")
  .setCustomId("dareog");

const todOgBtn = new ButtonBuilder()
  .setStyle(ButtonStyle.Primary)
  .setLabel("OG Random")
  .setCustomId("todog");

const chooseTodRow = new ActionRowBuilder().addComponents(
  truthBtn,
  dareBtn,
  todBtn
);

const chooseCustomTodRow = new ActionRowBuilder().addComponents(
  truthCustomBtn,
  dareCustomBtn,
  todCustomBtn
);

const chooseOgTodRow = new ActionRowBuilder().addComponents(
  truthOgBtn,
  dareOgBtn,
  todOgBtn
);

client.on("interactionCreate", async (interaction) => {
  let tod;
  let collection;
  switch (interaction.commandName || interaction.customId) {
    case "truth":
      truthOrDare(
        "truth",
        interaction,
        [...data.truths, ...customTruths],
        "both"
      );
      break;
    case "dare":
      truthOrDare("dare", interaction, [...data.dares, ...customDares], "both");
      break;
    case "tod":
      tod = Math.random() < 0.5 ? "truth" : "dare";
      collection = data[tod + "s"];

      collection = [
        ...collection,
        ...(tod === "truth" ? customTruths : customDares),
      ];
      truthOrDare(tod, interaction, collection, "both");
      break;
    case "truthcustom":
      truthOrDare("truth", interaction, customTruths, "custom");
      break;
    case "darecustom":
      truthOrDare("dare", interaction, customDares, "custom");
      break;
    case "todcustom":
      tod = Math.random() < 0.5 ? "truth" : "dare";
      collection = tod === "truth" ? customTruths : customDares;
      truthOrDare(tod, interaction, collection, "custom");
      break;
    case "truthog":
      truthOrDare("truth", interaction, data.truths, "og");
      break;
    case "dareog":
      truthOrDare("dare", interaction, data.dares, "og");
      break;
    case "todog":
      tod = Math.random() < 0.5 ? "truth" : "dare";
      truthOrDare(tod, interaction, data[tod + "s"], "og");
      break;
    case "customdares":
      interaction.user.send(customDares.join("\n"));
      break;
    case "customtruths":
      interaction.user.send(customTruths.join("\n"));
      break;
    case "add":
      const type = interaction.options.get("type").value;
      const modal = new ModalBuilder()
        .setCustomId("addTod" + interaction.user.id)
        .setTitle("Add a " + type + " to the bot");

      const textInput = new TextInputBuilder()
        .setCustomId("todInput")
        .setStyle(TextInputStyle.Short)
        .setLabel("Enter a " + type + ":")
        .setRequired(true);
      const actionRow1 = new ActionRowBuilder().addComponents(textInput);

      modal.addComponents(actionRow1);
      await interaction.showModal(modal);

      const filter = (i) => i.customId === "addTod" + interaction.user.id;
      interaction
        .awaitModalSubmit({ filter, time: 600000 })
        .then(async (modalInteraction) => {
          const tod = modalInteraction.fields.getTextInputValue("todInput");
          try {
            if (type === "truth") {
              customTruths.push(tod);
              const truth = new Truth({
                question: tod,
                author: interaction.user.username,
              });
              await truth.save();
            } else {
              customDares.push(tod);
              const dare = new Dare({
                question: tod,
                author: interaction.user.username,
              });
              await dare.save();
            }
          } catch (error) {
            console.error(error);
            modalInteraction.reply("Something went wrong");
          }
          modalInteraction.reply('Added "' + tod + '" to the bot');
        });
      break;
    case "newgame":
      games[interaction.channelId] = {
        players: [],
      };
      break;
    default:
      break;
  }
});

async function truthOrDare(tod, interaction, collection, type) {
  const header = `${tod.charAt(0).toUpperCase() + tod.substring(1)} for ${
    interaction.user.username
  }`;

  let randomTod = collection[Math.floor(Math.random() * collection.length)];
  const embed = new EmbedBuilder()
    .setTitle(randomTod)
    .setFooter(header)
    .setColor(0x0099ff);
  let component;
  if (type === "both") {
    component = chooseTodRow;
  } else if (type === "custom") {
    component = chooseCustomTodRow;
  } else {
    component = chooseOgTodRow;
  }
  await interaction.reply({
    embeds: [embed],
    components: [component],
  });
}

client.on("messageCreate", async (message) => {
  console.log(message.content);
});

// let dares = new Set();
// function delay(time) {
//   return new Promise((resolve) => setTimeout(resolve, time));
// }
// async function add() {
//   for (let i = 0; i < 600; i++) {
//     const data = await fetch(
//       "https://api.truthordarebot.xyz/api/dare?rating=PG13"
//     );
//     const json = await data.json();
//     dares.add(json.question);
//     console.log(json.question);
//     if (i === 500) {
//       console.log("Done");
//       console.log(...dares);

//       fs.writeFileSync(
//         "dares.js",
//         "let dares = " +
//           JSON.stringify([...dares]) +
//           ";\nmodule.exports = dares;"
//       );
//       break;
//     }
//     await delay(1000);
//   }
// }

// console.log(...dares);

// add();
