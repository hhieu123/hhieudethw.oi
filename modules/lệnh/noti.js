module.exports.info = {
	name: "noti",
    version: "1.0.1",
    permissions: 2,
    author: {
        name: "hhieu",
        facebook: "https://www.facebook.com/TrungHieu2k9/"
    },
	description: {
        long: "Gửi thông báo tới tất cả các box có ID trong Database",
        short: "Gửi thông báo"
    },
	group: "Dành Cho Quản Lí",
	guide: [
		'[text]',
	],
	countdown: 5
};

module.exports.run = async ({ api, event, args, Threads, Users }) => {
    var { threadID, messageID, senderID } = event;
	var allThread = await Threads.getAll(['ID']);
    allThread.filter(item => item.ID != threadID);
	var count = 0,
	    cannotSend = 0,
        name = (await Users.getData(senderID)).name;
    if (args.length == 0) return api.sendMessage("Bạn cần nhập thông báo.", threadID, messageID);
    for (var thread of allThread) {
        try {
            var members = (await Threads.getInfo(threadID)).participantIDs, mention = [];
            members.filter(item => item != api.getCurrentUserID() && item != senderID);
            for (var i of members) mention.push({ id: i, tag: "» Thông Báo «" });
            var msg = {
                body: `» Thông Báo «\n\n${args.join(' ')}\n\n${name == "Chử Xuân Hòa" ? "" : "Gửi Từ: " + name}`,
                mentions: mention
            }
            api.sendMessage(msg, thread.ID, (error, info) => {
                if (error) cannotSend++;
                else count++;
            });
        } catch (error) {
            api.sendMessage(`Đã xảy ra lỗi khi gửi thông báo tới nhóm có ID: ${thread.ID}.\n\nLỗi: ${error}`, threadID);
        }
    }
    return api.sendMessage(`Đã gửi thông báo đến ${count} nhóm thành công.\n\nKhông thể gửi đến ${cannotSend} nhóm.`, threadID);
}
