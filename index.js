// Warnable
// Version 1.0.0 - By www.zachary.fun

const Discord = require("discord.js");
const jsonDB = require("node-json-db").JsonDB;
const moment = require('moment-timezone');
const Filter = require('bad-words');
const badWords = new Filter();
const client = new Discord.Client();
const botDB = new jsonDB("botData", true, true);
const config = require("./config.json");
client.login(config.token);

// Bot Listening
client.on("ready", () => {
    console.log(`${client.user.username} is now ready!`);
    if (client.guilds.size > 1) console.warn("!!! WARNING !!! Warnable is not supported for more than one Discord server.\nStrikes do NOT save for each server, all warnings sync across servers for users.\nThis may be supported in the future, but do not make an issue if you are using it in more than one server please :("); 
});

function addDays(date, days) {
  const copy = new Date(Number(date))
  copy.setDate(date.getDate() + days)
  return copy
}

//- Commands
const commands = {
    "!help": (msg) => {
      if (msg.channel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                msg.channel.send("", {embed: {
                    color: 0x4287F5,
                    title: "Command Help",
                    fields: [
                        {
                            name: "**!Demote**",
                            value: "Use !demote [@user] [rank to demote them to] [reason] to demote a staff member!",
                            inline: false
                        },  
                        {
                            name: "**!Suspend**",
                            value: "Use !suspend [@user] [duration (purely numerical and in days)] [reason] to suspend a staff member!",
                            inline: false
                        },
                        {
                            name: "**!Strike**",
                            value: "Use !strike [@user] [reason] to strike a staff member!",
                            inline: false
                        },
                        {
                            name: "**!Strikes**",
                            value: "To view someones strikes, use !strikes [@user]!",
                            inline: false
                        },
                        {
                            name: "**!Fire**",
                            value: "Use !fire [@user] [reason] to fire a staff member!",
                            inline: false
                        },
                    ]
                }});
            }
    },
    "strike": (msg) => {
      if(msg.member.highestRole.comparePositionTo(msg.mentions.members.first().highestRole) < 0){
    //member has higher role then first mentioned member
     return msg.reply("You cannot strike someone higher than you.");
      }
        if (msg.mentions.members.first().id == msg.author.id)
          return msg.reply(":no_entry_sign: I cannot allow self harm. Why do you want to strike yourself. :thinking:")
        if (msg.mentions.members.first().id == 345323396399366165) 
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to strike this user. He plays Entry Point and likes Sans!")
        if (msg.mentions.members.first().id == 711080411010433055)  
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to strike this user. I am the god of punishments!")
        if (msg.mentions.members.first().id == 251664182116614144)
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to strike this user. This user created me.")
        if (msg.content.split(" ")[1].startsWith("<")) {
            if (msg.mentions.members.first()) {
                var warningUser = msg.mentions.members.first().id;
                const args = msg.content.slice(config.prefix.Length).trim().split(/ +/g);
                let warningReason = args.slice(2).join(" ");
                if (warningReason !== "") {
                    warningAdd(warningUser, warningReason, msg.author, msg.guild, function(res) {
                        msg.channel.send(res);
                    });
                }
                else {
                    msg.reply("A reason must be included.");
                }
            }
            else {
                msg.reply("The mention is invalid.");
            }
        }
        else if (msg.content.split(" ")[1].startsWith('"')) {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                if (warningUser) {
                    var warningReason = msg.content.replace(config.prefix + 'warn' + warningUsername);
                    if (warningReason !== "") {
                        warningAdd(warningUser, warningReason, msg.author, msg.guild, function(res) {
                            msg.channel.send(res);
                        });
                    }
                    else {
                        msg.reply("A reason must be included.");
                    }
                } 
                else {
                    msg.reply("Unable to find user.");
                }
            }
        }
        else {
            msg.reply("Command used incorrectly. Try mentioning the user!");
        }
    },
    "removestrike": (msg) => {
        var warnID = msg.content.split(" ")[1]
        if (warnID) {
            warningRemove(msg.author.id, warnID, function(res) {
                msg.reply(res);
            });
        }
        else {
            msg.channel.send("A strike ID must be specified.");
        }
    },
        "suspend": (msg) => {
      if(msg.member.highestRole.comparePositionTo(msg.mentions.members.first().highestRole) < 0){
    //member has higher role then first mentioned member
     return msg.reply("You cannot suspend someone higher than you.");
      }
          if (msg.mentions.members.first().id == msg.author.id)
          return msg.reply(":no_entry_sign: I cannot allow self harm. Why do you want to suspend yourself. :thinking:")
          if (msg.mentions.members.first().id == 345323396399366165) 
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to suspend this user. He plays Entry Point and likes Sans!")
        if (msg.mentions.members.first().id == 711080411010433055)  
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to suspend this user. I am the god of punishments!")
        if (msg.mentions.members.first().id == 251664182116614144)
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to suspend this user. This user created me.")
        if (msg.content.split(" ")[1].startsWith("<")) {
            if (msg.mentions.members.first()) {
                var warningUser = msg.mentions.members.first().id;
                const args = msg.content.slice(config.prefix.Length).trim().split(/ +/g);
                let [command, user, duration, reason] = args;
                let warningReason = args.slice(3).join(" ");
                var dduration = duration
                if (dduration == parseInt(dduration,10)) {
                }
                else {
                  msg.reply("Your duration argument must be purely numerical. Type !!help if you need command help.")
                  return;
                }
                if (dduration !== undefined) {
                }
              else {
                msg.reply("A duration must be specified");
                return;
              }
              
              if (warningReason !== undefined) {
                }
              else {
                msg.reply("A reason must be specified");
                return;
              }
                
                if (warningReason !== "") {
                    demote(dduration, warningUser, warningReason, msg.author, msg.guild, function(res) {
                        msg.channel.send(res);
                    });
                }
                else {
                    msg.reply("A reason must be included.");
                }
            }
            else {
                msg.reply("The mention is invalid.");
            }
        }
        else if (msg.content.split(" ")[1].startsWith('"')) {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                if (warningUser) {
                    var warningReason = msg.content.replace(config.prefix + 'warn' + warningUsername);
                    if (warningReason !== "") {
                        warningAdd(dduration, warningUser, warningReason, msg.author, msg.guild, function(res) {
                            msg.channel.send(res);
                        });
                    }
                    else {
                        msg.reply("A reason must be included.");
                    }
                } 
                else {
                    msg.reply("Unable to find user.");
                }
            }
        }
        else {
            msg.reply("Command used incorrectly. Try mentioning the user!");
        }
    },
    "demote": (msg) => {
      if(msg.member.highestRole.comparePositionTo(msg.mentions.members.first().highestRole) < 0){
    //member has higher role then first mentioned member
     return msg.reply("You cannot demote someone higher than you.");
      }
          if (msg.mentions.members.first().id == msg.author.id)
          return msg.reply(":no_entry_sign: I cannot allow self harm. Why do you want to demote yourself. :thinking:")
          if (msg.mentions.members.first().id == 345323396399366165) 
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to demote this user. He plays Entry Point and likes Sans!")
        if (msg.mentions.members.first().id == 711080411010433055)  
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to demote this user. I am the god of punishments!")
        if (msg.mentions.members.first().id == 251664182116614144)
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to demote this user. This user created me.")
        if (msg.content.split(" ")[1].startsWith("<")) {
            if (msg.mentions.members.first()) {
                var warningUser = msg.mentions.members.first().id;
                const args = msg.content.slice(config.prefix.Length).trim().split(/ +/g);
                let [command, user, rank, reason] = args;
                let warningReason = args.slice(3).join(" ");
                var rrank = rank
                if (rank !== undefined) {
                }
              else {
                msg.reply("A rank to demote the user to must be specified");
                return;
              }
              
              if (warningReason !== undefined) {
                }
              else {
                msg.reply("A reason must be specified");
                return;
              }
                
                if (warningReason !== "") {
                    ddemote(rrank, warningUser, warningReason, msg.author, msg.guild, function(res) {
                        msg.channel.send(res);
                    });
                }
                else {
                    msg.reply("A reason must be included.");
                }
            }
            else {
                msg.reply("The mention is invalid.");
            }
        }
        else if (msg.content.split(" ")[1].startsWith('"')) {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                if (warningUser) {
                    var warningReason = msg.content.replace(config.prefix + 'warn' + warningUsername);
                    if (warningReason !== "") {
                        ddemote(rrank, warningUser, warningReason, msg.author, msg.guild, function(res) {
                            msg.channel.send(res);
                        });
                    }
                    else {
                        msg.reply("A reason must be included.");
                    }
                } 
                else {
                    msg.reply("Unable to find user.");
                }
            }
        }
        else {
            msg.reply("Command used incorrectly. Try mentioning the user!");
        }
    },
    "fire": (msg) => {
      if(msg.member.highestRole.comparePositionTo(msg.mentions.members.first().highestRole) < 0){
    //member has higher role then first mentioned member
     return msg.reply("You cannot fire someone higher than you.");
      }
          if (msg.mentions.members.first().id == msg.author.id)
          return msg.reply(":no_entry_sign: I cannot allow self harm. Why do you want to fire yourself. :thinking:")
          if (msg.mentions.members.first().id == 345323396399366165) 
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to fire this user. He plays Entry Point and likes Sans!")
        if (msg.mentions.members.first().id == 711080411010433055)  
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to fire this user. I am the god of punishments!")
        if (msg.mentions.members.first().id == 251664182116614144)
          return msg.reply(":cloud_lightning: You do not have sufficient permissions to fire this user. This user created me.")
        if (msg.content.split(" ")[1].startsWith("<")) {
            if (msg.mentions.members.first()) {
                var warningUser = msg.mentions.members.first().id;
                const args = msg.content.slice(config.prefix.Length).trim().split(/ +/g);
                let [command, user, rank, reason] = args;
                let warningReason = args.slice(2).join(" ");
              
              if (warningReason !== undefined) {
                }
              else {
                msg.reply("A reason must be specified");
                return;
              }
                
                if (warningReason !== "") {
                    terminate(warningUser, warningReason, msg.author, msg.guild, function(res) {
                        msg.channel.send(res);
                    });
                }
                else {
                    msg.reply("A reason must be included.");
                }
            }
            else {
                msg.reply("The mention is invalid.");
            }
        }
        else if (msg.content.split(" ")[1].startsWith('"')) {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                if (warningUser) {
                    var warningReason = msg.content.replace(config.prefix + 'warn' + warningUsername);
                    if (warningReason !== "") {
                        terminate(warningUser, warningReason, msg.author, msg.guild, function(res) {
                            msg.channel.send(res);
                        });
                    }
                    else {
                        msg.reply("A reason must be included.");
                    }
                } 
                else {
                    msg.reply("Unable to find user.");
                }
            }
        }
        else {
            msg.reply("Command used incorrectly. Try mentioning the user!");
        }
    },
    "strikes": (msg) => {
        if (msg.content.split(" ")[1].startsWith("<")) {
            if (msg.mentions.members.first()) {
                var warningUser = msg.mentions.members.first();
                var warnList = dbRequest("/users/" + warningUser.id);
                if (warnList == "") {
                   msg.reply("User has no strikes.");
                  return;  
                }
                if (warnList !== undefined) {
                    var warnEmbed = [];
                    var warnText = "";
                    for (i=0; i < warnList.length; i++) {
                        var warnInfo = dbRequest("/warnings/" + warnList[i]);
                        if (warnInfo) {
                            warnEmbed.push({ name: `Strike '${warnList[i]}'`, value: `By: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`});
                            warnText = warnText + `\n**- Strike '${warnList[i]}**'\nBy: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`;
                        }
                        if (warnList.length == i + 1) { 
                            if (msg.channel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                                msg.channel.send("", {embed: {
                                    color: 0x4287F5,
                                    title: "Strikes",
                                    description: "Listing strikes for " + warningUser,
                                    fields: warnEmbed
                                }});
                            }
                            else {
                                msg.channel.send(`**__Listing strikes for ${warningUser}__**${warnText}`);
                            }
                        }
                    }
                }
                else {
                    msg.reply("User has no strikes.");
                }
            }
            else {
                msg.reply("The mention is invalid.");
            }
        }
        else if (msg.content.split(" ")[1].startsWith('"')) {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                var warnList = dbRequest("/users/" + warningUser);
                if (warnList !== undefined) {
                    var warnEmbed = [];
                    var warnText = "";
                    for (i=0; i < warnList.length; i++) {
                        var warnInfo = dbRequest("/warnings/" + warnList[i]);
                        if (warnInfo) {
                            warnEmbed.push({ name: `Strike '${warnList[i]}'`, value: `By: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`});
                            warnText = warnText + `\n**- Strike '${warnList[i]}**'\nBy: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`;
                        }
                        if (warnList.length == i + 1) { 
                            if (msg.channel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                                msg.channel.send("", {embed: {
                                    color: 0x4287F5,
                                    title: "Strikes",
                                    description: "Listing strikes for " + warningUser,
                                    fields: warnEmbed
                                }});
                            }
                            else {
                                msg.channel.send(`**__Listing strikes for ${warningUser}__**${warnText}`);
                            }
                        }
                    }
                }
                else {
                    msg.reply("User has no strikes.");
                }
            }
        }
        else {
            msg.reply("Command used incorrectly. Try mentioning the user!");
        }
    }
};

client.on("message", msg => {
    if (msg.guild) {
        if (msg.content.startsWith(config.prefix)) {
            if (commands.hasOwnProperty(msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) {
                if (msg.member.roles.array().some(r => config.admins.roles.indexOf(r.id) >= 0) || config.admins.users.includes(msg.author.id)) {
                    commands[msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](msg);
                }
                else {
                    msg.reply("You don't have permission to use this command.");
                }
            }
        }
        // Rules
        if (!msg.author.bot && msg.guild.id == config.channels.guild) {
            if (!config.channels.ignore.includes(msg.channel.id)) {
                if (msg.content.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/gm)) {
                    if (config.automation.discordInvites.deleteMessage) msg.delete();
                    if (config.automation.discordInvites.giveWarning) warningAdd(msg.author.id, "Automatic: Discord Invite", client.user, msg.guild, function() {});
                }
                else if (badWords.isProfane(msg.content)) {
                    if (config.automation.swearing.deleteMessage) msg.delete();
                    if (config.automation.swearing.giveWarning) warningAdd(msg.author.id, "Automatic: Swearing", client.user, msg.guild, function() {});
                }
                else if (msg.content.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/gm)) {
                    if (config.automation.externalLinks.deleteMessage) msg.delete();
                    if (config.automation.externalLinks.giveWarning) warningAdd(msg.author.id, "Automatic: Links", client.user, msg.guild, function() {});
                }
            }
        }
    }
});

// Warning Functions
function warningAdd(uid, reason, issuer, guild, callback) {
    try {
        if (guild.members.get(uid).roles.get(config.roles.immuneRole)) {
            callback("You do not have the authority to strike this user!");
        }
        else {
            var warningID = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
            botDB.push("/warnings/" + warningID, { user: uid, reason: reason, issuer: issuer.id, time: new Date() });
            var totalWarnings;
            if (dbRequest("/users/" + uid) !== undefined) {
                var warnings = dbRequest("/users/" + uid);
                warnings.push(warningID);
                botDB.push("/users/" + uid, warnings);
                totalWarnings = warnings.length.toString();
            }
            else {
                botDB.push("/users/" + uid, [warningID]);
                totalWarnings = "1";
            }
            warningCheck(uid, guild);
            callback("Strike has been added to <@" + uid + ">\nStrike ID: ``" + warningID + "``");
            var warnLogChannel = client.guilds.get(config.channels.guild).channels.get(config.channels.log.strikes);
            if (warnLogChannel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                warnLogChannel.send("", {embed: {
                    color: 0x4287F5,
                    title: "Staff Striked (" + warningID + ")",
                    description: "<@" + uid + "> was striked for:\n```" + reason + "```",
                    fields: [
                        {
                            name: "Issuer",
                            value: "<@" + issuer.id + ">",
                            inline: true
                        },
                        {
                            name: "Time",
                            value: moment().tz("UTC").format("MMM Do YY, h:mm:ss a") + " (UTC)",
                            inline: true
                        },
                        {
                            name: "Total Strikes",
                            value: totalWarnings,
                            inline: true
                        }
                    ]
                }});
            }
            else {
                warnLogChannel.send("**__New Strike (" + warningID + ")__**\nUser Striked: <@" + uid + ">\nReason: `" + reason + "`\nIssuer: <@" + issuer.id + "> | Time: " + moment().tz("UTC").format("MMM Do YY, h:mm:ss a") + " (UTC) | Total strikes: " + totalWarnings);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

function demote(duration, uid, reason, issuer, guild, callback) {
    try {
        if (guild.members.get(uid).roles.get(config.roles.immuneRole)) {
            callback("You do not have the authority to suspend this user!");
        }
        else {
            callback("User <@" + uid + "> has been suspended!");
            var warnLogChannel = client.guilds.get(config.channels.guild).channels.get(config.channels.log.strikes);
            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            var date = new Date();
            var dur = Math.floor(duration)
            date.setDate(date.getDate() + dur);
            console.log(dur)
            console.log(date)
            if (warnLogChannel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                warnLogChannel.send("", {embed: {
                    color: 0x4287F5,
                    title: "Staff Suspended",
                    description: "<@" + uid + "> was suspended for:\n```" + reason + "```",
                    fields: [
                        {
                            name: "Issuer",
                            value: "<@" + issuer.id + ">",
                            inline: true
                        },
                        {
                            name: "End Date",
                            value: date.toLocaleDateString("en-US", config), // 9/17/2016
                            inline: true
                        },  
                        {
                            name: "Time",
                            value: moment().tz("UTC").format("MMM Do YY, h:mm:ss a") + " (UTC)",
                            inline: true
                        },
                    ]
                }});
            }
            else {
                callback("Error") 
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

function ddemote(duration, uid, reason, issuer, guild, callback) {
    try {
        if (guild.members.get(uid).roles.get(config.roles.immuneRole)) {
            callback("You do not have the authority to suspend this user!");
        }
        else {
            callback("User <@" + uid + "> has been demoted!");
            var warnLogChannel = client.guilds.get(config.channels.guild).channels.get(config.channels.log.strikes);
            if (warnLogChannel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                warnLogChannel.send("", {embed: {
                    color: 0x4287F5,
                    title: "Staff Demoted",
                    description: "<@" + uid + "> was demoted to: \n```" + duration + "``` Reason:\n```" + reason + "```",
                    fields: [
                        {
                            name: "Issuer",
                            value: "<@" + issuer.id + ">",
                            inline: true
                        },  
                        {
                            name: "Time",
                            value: moment().tz("UTC").format("MMM Do YY, h:mm:ss a") + " (UTC)",
                            inline: true
                        },
                    ]
                }});
            }
            else {
                callback("Error") 
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

function terminate(uid, reason, issuer, guild, callback) {
    try {
        if (guild.members.get(uid).roles.get(config.roles.immuneRole)) {
            callback("You do not have the authority to fire this user!");
        }
        else {
            callback("User <@" + uid + "> has been fired!");
            var warnLogChannel = client.guilds.get(config.channels.guild).channels.get(config.channels.log.strikes);
            if (warnLogChannel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                warnLogChannel.send("", {embed: {
                    color: 0x4287F5,
                    title: "Staff Fired",
                    description: "<@" + uid + "> was fired for:\n```" + reason + "```",
                    fields: [
                        {
                            name: "Issuer",
                            value: "<@" + issuer.id + ">",
                            inline: true
                        },  
                        {
                            name: "Time",
                            value: moment().tz("UTC").format("MMM Do YY, h:mm:ss a") + " (UTC)",
                            inline: true
                        },
                    ]
                }});
            }
            else {
                callback("Error") 
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}


function warningRemove(issuer, wid, callback) {
    var warningInfo = dbRequest("/warnings/" + wid);
    if (warningInfo !== undefined) {
        var userWarns = dbRequest("/users/" + warningInfo.user);
        var warnPosition = userWarns.indexOf(wid);
        if (warnPosition > -1) {
            if (warningInfo.user != issuer) {
                botDB.delete("/warnings/" + wid);
                userWarns.splice(warnPosition, 1);
                botDB.push("/users/" + warningInfo.user, userWarns);               callback("Strike has been removed.");
            } else {
                callback("You cannot remove your own strike.")
            }
        }
        else {
            callback("This strike has already been removed from the user.");
        }
    }
    else {
        callback("Strike ID does not exist.");
    }
}

function warningCheck(uid, guild) {
    var userWarns = dbRequest("/users/" + uid);
    try {
        if (userWarns !== undefined) {
            var warnedUser = guild.members.get(uid);
            if (userWarns.length == config.rules.RmuteAfter) {
                warnedUser.addRole(config.roles.muteRole)
                .then(function() {
                    client.guilds.get(config.channels.guild).channels.get(config.channels.log.alerts).send(`:boot: The user <@${warnedUser.id}> (${warnedUser.user.username}#${warnedUser.user.discriminator}) has had the mute role added to them for reaching **${config.rules.RmuteAfter}** warnings.`);
                });
            }
            if (userWarns.length == config.rules.kickAfter) {
                warnedUser.kick(`User has reached ${config.rules.kickAfter} warnings`)
                .then(function() {
                    client.guilds.get(config.channels.guild).channels.get(config.channels.log.alerts).send(`:boot: The user <@${warnedUser.id}> (${warnedUser.user.username}#${warnedUser.user.discriminator}) has been kicked from the server for raching **${config.rules.kickAfter}** warnings.`);
                });
            }
            if (userWarns.length == config.rules.banAfter) {
                warnedUser.ban({reason: `User has reached ${config.rules.banAfter} warnings`})
                .then(function() {
                    client.guilds.get(config.channels.guild).channels.get(config.channels.log.alerts).send(`:hammer: The user <@${warnedUser.id}> (${warnedUser.user.username}#${warnedUser.user.discriminator}) has been banned from the server for raching **${config.rules.banAfter}** warnings.`);
                });
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

// Additional Functions
function extractUsername(str){
    const matches = str.match(/"(.*?)"/);
    return matches ? matches[1] : str;
}

function findUsernameUser(username) {
    var usernameSplit = username.split("#");
    var findUsers = client.users.findAll("username", usernameSplit[0]);
    for (i=0; i < findUsers.length; i++) {
        if (findUsers[i].discriminator == usernameSplit[1]) {
            return findUsers[i].id;
        }
    }
}

function dbRequest(path) {
    try { return botDB.getData(path); }
    catch (err) { return undefined; }
}          