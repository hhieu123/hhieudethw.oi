module.exports.info = {
	name: "giveaway",
    version: "1.0.0",
    permissions: 1,
    author: {
        name: "hhieu",
        facebook: "https://www.facebook.com/TrungHieu2k9/"
    },
	description: {
        long: "GiveAway dành cho box",
        short: "GiveAway dành cho box"
    },
	group: "Mini Game",
	guide: [
		'[create/detail/join/roll/end] [Phần Thưởng]',
	],
	countdown: 5
};

module.exports.handleReactionMessage = async ({ api, event, Users, Reaction, Threads, tecna }) => {
    if (event.type != 'message_reaction') return;
    var { userID, threadID } = event;
    var data = tecna.GA.get(Reaction.ID);
    if (data.trangthai == 'close') return;
    if (event.reaction == undefined) {
        data.thamgia.splice(data.thamgia.indexOf(userID), 1);
        var threadInfo = await Threads.getInfo(threadID);
        if (!threadInfo.nicknames[userID]) threadInfo = (await Users.getData(userID)).name;
        else threadInfo = (threadInfo.nicknames[userID]);
        return api.sendMessage(`- ${threadInfo} đã rời GiveAway có ID: #${Reaction.ID} của ${data.author}`, userID);
    }
    data.thamgia.push(userID);
    tecna.GA.set(Reaction.ID, data)
    var threadInfo = await Threads.getInfo(threadID);
    if (!threadInfo.nicknames[userID]) threadInfo = (await Users.getData(userID)).name;
    else threadInfo = (threadInfo.nicknames[userID]);
    return api.sendMessage(`- ${threadInfo} Đã tham gia thành công GiveAway có ID: #${Reaction.ID} của ${data.author}`, userID);
}

module.exports.run = async ({ api, event, multiple, args, Users, Threads, tecna }) => {
    var { body, threadID, messageID, senderID } = event;
    if (!tecna.GA) tecna.GA = new Map();
    switch (args[0]) {
        case "create":
        case "Tạo":
        case "-c":
        case "-t":
            var reward = args.slice(1).join(" ");
            var random = (Math.floor(Math.random() * 100000) + 100000).toString().substring(1);
            var threadInfo = await Threads.getInfo(threadID);
            var nicknames = "";
            if (!threadInfo.nicknames[senderID]) nicknames = (await Users.getData(senderID)).name;
            else nicknames = (threadInfo.nicknames[senderID]);
            var msg = "=== Give Away ===\n\n" +
            `Người Tạo: ${nicknames}\n` +
            `Phần Thưởng: ${reward}\n` +
            `ID: ${random}\n\n` +
            `Thả cảm xúc vào tin nhắn này để tham gia.`
            return api.sendMessage(msg, threadID, (error, info) => {
                var data = {
                    ID: random,
                    author: nicknames,
                    authorID: senderID,
                    messageID: info.messageID,
                    reward: reward,
                    thamgia: [],
                    trangthai: 'open'
                }
                tecna.GA.set(random, data)
                multiple.handleReactionMessage.push({
                    name: this.info.name,
                    messageID: info.messageID,
                    ID: random
                })
            })
        case "detail":
        case "chitiet":
        case "-d":
            if (!args[1]) return api.sendMessage("Bạn cần nhập ID GiveAway muốn xem.", threadID, messageID);
            var ID = args[1].replace("#", ""), msg = "";
            if (!ID || isNaN(ID)) return api.sendMessage("ID GiveAway bạn nhập không hợp lệ.", threadID, messageID);
            var data = tecna.GA.get(ID);
            if (!data) return api.sendMessage("ID GiveAway bạn nhập không tồn tại!", threadID, messageID);
            msg = "=== Give Away ===\n\n" +
            `Người Tạo: ${data.author}\n` +
            `Phần Thưởng: ${data.reward}\n` +
            `ID: ${data.ID}\n` +
            `Đã Tham Gia: ${data.thamgia.length} người\n` +
            `Trạng Thái: ${data.trangthai}`
            return api.sendMessage(msg, threadID, messageID);
        case "join":
        case "thamgia":
        case "-j":
            if (!args[1]) return api.sendMessage("Bạn cần nhập ID GiveAway muốn xem.", threadID, messageID);
            var ID = args[1].replace("#", ""), msg = "";
            if (!ID || isNaN(ID)) return api.sendMessage("ID GiveAway bạn nhập không hợp lệ.", threadID, messageID);
            var data = tecna.GA.get(ID);
            if (!data) return api.sendMessage("ID GiveAway bạn nhập không tồn tại!", threadID, messageID);
            if (data.thamgia.includes(senderID)) return api.sendMessage("Bạn đã tham gia GiveAway này", threadID, messageID);
            data.thamgia.push(senderID);
            tecna.GA.set(ID, data);
            var threadInfo = await Threads.getInfo(threadID);
            if (!threadInfo.nicknames[senderID]) threadInfo = (await Users.getData(senderID)).name;
            else threadInfo = (threadInfo.nicknames[senderID]);
            return api.sendMessage(`- ${threadInfo} đã tham gia thành công GiveAway có ID: #${ID} của ${data.author}`, senderID);
        case "roll":
        case "quay":
        case "-r":
            if (!args[1]) return api.sendMessage("Bạn cần nhập ID GiveAway muốn xem.", threadID, messageID);
            var ID = args[1].replace("#", ""), msg = "";
            if (!ID || isNaN(ID)) return api.sendMessage("ID GiveAway bạn nhập không hợp lệ.", threadID, messageID);
            var data = tecna.GA.get(ID);
            if (!data) return api.sendMessage("ID GiveAway bạn nhập không tồn tại!", threadID, messageID);
            if (data.authorID !== senderID) return api.sendMessage("Bạn không phải là người chủ trì GiveAway này!", threadID, messageID);
            var winner = data.thamgia[Math.floor(Math.random() * data.thamgia.length)];
            var userInfo = await Users.getData(winner) || await Users.getInfo(winner);
            msg = `Chúc mừng ${userInfo.name}, bạn đã thắng giải thưởng của ${data.author}\n\n` +
            `Để nhận phần thưởng của mình, hãy liên hệ với ${data.author} để nhận phần thưởng của mình: http://facebook.com/${data.authorID}`
            return api.sendMessage({
                body: msg,
                mentions: [
                    {
                        tag: userInfo.name,
                        id: winner
                    },{
                        tag: data.author,
                        id: data.authorID
                    }
                ]
            }, threadID, messageID)
        case "end":
        case "ketthuc":
        case "close":
        case "dong":
        case "-k": 
            if (!args[1]) return api.sendMessage("Bạn cần nhập ID GiveAway muốn xem.", threadID, messageID);
            var ID = args[1].replace("#", ""), msg = "";
            if (!ID || isNaN(ID)) return api.sendMessage("ID GiveAway bạn nhập không hợp lệ.", threadID, messageID);
            var data = tecna.GA.get(ID);
            if (!data) return api.sendMessage("ID GiveAway bạn nhập không tồn tại!", threadID, messageID);
            if (data.author !== senderID) return api.sendMessage("Bạn không phải là người chủ trì GiveAway này!", threadID, messageID);
            data.trangthai = 'close';
            tecna.GA.set(ID, data);
            api.unsendMessage(data.messageID);
            return api.sendMessage(`${data.author} đã đóng GiveAway có ID: #${data.ID}`, threadID, messageID);
        default:
            return tecna.commandError(this.info.name, threadID, messageID);
    }
}