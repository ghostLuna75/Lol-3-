const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const mongoose = require("mongoose");

class ScuffedGuard extends Client {
  constructor() {
    super({
      failIfNotExists: true,
      allowedMentions: {
        parse: ["everyone", "roles", "users"],
      },
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildInvites,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
      ],
    });
    this.slashCommands = new Collection();
    this.config = require("../config.js");
    this.owner = this.config.ownerID;
    this.prefix = this.config.prefix;
    this.colour = this.config.emColour
    this.aliases = new Collection();
    this.commands = new Collection();
    this.logger = require("../utils/logger.js");
    this.emoji = require("../utils/emoji.json");
    this.functions = require("../utils/functions.js");
    if (!this.token) this.token = this.config.token;
    
    
    this.rest.on("rateLimited", (info) => {
      this.logger.log(info, "log");
    });

    /**
     *  Mongose for data base
     */
    const dbOptions = {
      useNewUrlParser: true,
      autoIndex: false,
      connectTimeoutMS: 10000,
      family: 4,
      useUnifiedTopology: false,
    };
    
    mongoose.connect(this.config.mongourl, dbOptions);
    mongoose.Promise = global.Promise;

    
    mongoose.connection.on("connected", () => {
      this.logger.log("[DB] DATABASE CONNECTED", "ready");
    });
    mongoose.connection.on("err", (err) => {
      console.log(`Mongoose connection error: \n ${err.stack}`, "error");
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected");
    }); 

    
//mongo ends
    ["commands", "events"].forEach((handler) => {
      require(`../handlers/${handler}`)(this);
    });
  }
  connect() {
    return super.login(this.token);
  }
}

module.exports = ScuffedGuard;
