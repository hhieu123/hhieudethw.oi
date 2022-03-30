module.exports.info = {
	name: "ban",
	version: "1.0.1",
	permissions: 2,
	author: {
		name: "hhieu",
		facebook: "https://www.facebook.com/TrungHieu2k9/"
	},
	description: {
        long: "Có thể cấm người dùng nào đó không thể sử dụng Bot cho đến khi được ân xá",
        short: "Cấm người dùng"
    },
	group: "Dành Cho Quản Lí",
	guide: [
		'[list/tag]',
	],
	countdown: 5
};

module.exports.handleMessageReply = async function({ api, event, multiple, Reply, Users, tecna }) {
    var { banned, type } = Reply, { mentions, threadID, senderID, body } = event;
    if (Reply.author != senderID) return;
    var fullTime = tecna.getTime("fullTime");
    api.unsendMessage(Reply.messageID);
    if (type == 'view') {
        if (!mentions) return api.sendMessage('Bạn cần tag người đã bị ban để xem lí do.', threadID);
        var mention = Object.keys(mentions);
        var msg = "", number = 0;
        for (var i of mention) {
            for (var info of banned) {
                number++;
                if (i == info.ID) msg += `${number}. ${info.name}: ${info.banned.lido}\n\nNgười ban: ${info.banned.author}\nNgày ban: ${info.banned.time}`
            }
        }
        return api.sendMessage(msg, threadID);
    }
    var authorBan = await Users.getData(senderID);
    var bannedInfo = await Users.getData(banned);
    if (bannedInfo.banned && bannedInfo.banned.status == true) {
        bannedInfo.banned.lido.push(body);
        await Users.setData(banned, bannedInfo);
        return api.sendMessage(`- ${bannedInfo.name} đã bị ${type} thêm với lí do: ${body}.`, threadID);
    }
    bannedInfo.banned = {
        status: true,
        lido: [body],
        author: authorBan.name,
        type: type,
        time: fullTime
    }
    await Users.setData(banned, bannedInfo);
    multiple.allUsersBanned.set(banned);
    return api.sendMessage(`- ${bannedInfo.name} đã bị ${type} với lí do: ${body}.`, threadID);
}

module.exports.run = async function({ api, event, multiple, args, Users }) {
    var { mentions, threadID, messageID, senderID } = event;
    var mention = Object.keys(mentions);
    if (args[0] == 'list') {
        var allUsers = await Users.getAll(['banned', 'name']);
        var banned = [], msg = "Danh sách thành viên đang bị Ban:\n\n", number = 0;
        for (var i of allUsers) {
            if (i.banned && i.banned.status == true) {
                banned.push({ 'ID': i.ID, 'name': i.name, 'banned': i.banned });
            }
        }
        if (banned.length == 0) return api.sendMessage('Hiện tại không có người dùng nào bị ban.', threadID);
        for (var i of banned) {
            number++;
            msg += `${number}. ${i.name} ${i.banned.type == 'superBan' ? 'ngậm ' + i.banned.type : 'bị ' + i.banned.type} từ ${i.banned.time}\n`
        }
        return api.sendMessage(`${msg}\nReply tin nhắn này tag kèm người có trong danh sách để xem lí do.`, threadID, (error, info) => {
            multiple.handleMessageReply.push({
                name: this.info.name,
                messageID: info.messageID,
                author: senderID,
                banned: banned,
                type: 'view'
            });
        }, messageID);
    }
    if (mention.length == 0) return api.sendMessage("Bạn cần tag người muốn ban!", threadID, messageID);
    if (mention.length > 1) return api.sendMessage("Bạn chỉ có thể ban một người mỗi lần!", threadID, messageID);
    var bannedInfo = await Users.getData(mention);
    if (!bannedInfo) return api.sendMessage("Người dùng này chưa có trong Database!", threadID, messageID);
    if (bannedInfo.banned && bannedInfo.banned.status == true) return api.sendMessage(`Người dùng này đã bị ${bannedInfo.banned.author} ${bannedInfo.banned.type} từ ${bannedInfo.banned.time}.\nLí do: ${bannedInfo.banned.lido}!`, threadID, messageID);
    var Ry = '100005548624106';
    var botID = api.getCurrentUserID();
    if (mention == botID) return api.sendMessage("Mày muốn gì?", threadID, messageID);
    api.sendMessage(`Vui lòng trả lời tin nhắn này kèm lí do bạn muốn cấm người dùng này sử dụng Bot?`, threadID, (error, info) => {
        multiple.handleMessageReply.push({
            name: this.info.name,
            messageID: info.messageID,
            author: senderID,
            banned: mention,
            type: senderID == Ry ? 'superBan' : 'ban'
        });
    }, messageID);
}