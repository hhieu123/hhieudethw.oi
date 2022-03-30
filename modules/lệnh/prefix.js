module.exports.info = {
	name: "prefix",
    version: "1.0.1",
    permissions: 2,
    author: {
        name: "hhieu",
        facebook: "https://www.facebook.com/TrungHieu2k9/"
    },
	description: {
        long: "Đổi prefix cho nhóm hiện tại",
        short: "Đổi prefix"
    },
	group: "Box Settings",
	guide: [
		'[prefix]',
	],
	countdown: 5
};

module.exports.handleReactionMessage = async function({ api, event, multiple, Threads, Reaction }) {
    var { threadID, userID } = event;
    var { author, messageID, prefix } = Reaction;
	if (userID != author) return;
	api.unsendMessage(messageID);
    await Threads.setData(threadID, { prefix: prefix });
	return api.sendMessage(`Đã chuyển đổi Prefix của nhóm thành: ${prefix}`, threadID);
}

module.exports.run = async ({ api, event, args, multiple, Threads, tecna }) => {
    var { threadID, messageID, senderID } = event;
    var prefix = args[0].trim();
    if (!prefix) return api.sendMessage(`Vui lòng nhập default hoặc prefix mà bạn muốn đổi`, threadID, messageID);
    if (prefix == 'default') {
        await Threads.setData(threadID, { prefix: tecna.configs.prefix })
        return api.sendMessage(`Đã reset prefix của nhóm về mặc định: ${tecna.configs.prefix}`, threadID);
    } else {
        return api.sendMessage(`Bạn có chắc muốn đổi prefix của nhóm thành '${prefix}' không?\n\nThả cảm xúc vào tin nhắn này để xác nhận.`, threadID, (error, info) => {
            multiple.handleReactionMessage.push({
                name: this.info.name,
                messageID: info.messageID,
                author: senderID,
                prefix: prefix
            })
        })
    }
}