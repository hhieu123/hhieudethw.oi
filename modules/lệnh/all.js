module.exports.info = {
	name: "all",
	version: "1.0.1",
	permissions: 2,
	author: {
		name: "hhieu",
		facebook: "https://www.facebook.com/TrungHieu2k9/"
	},
	description: {
        long: "Tag tất cả các thành viên đang có trong Group này",
        short: "Tag tất cả các thành viên"
    },
	group: "System",
	guide: [
		'[Để trống hoặc thêm lời nhắc]',
	],
	countdown: 5
};

module.exports.run = async function({ api, event, args, multiple }) {
	var { threadID, messageID } = event;
	try {
        var listUserIDs = (await api.getThreadInfo(threadID)).participantIDs;
		listUserIDs = listUserIDs.filter(ID => ID != api.getCurrentUserID());
		var body = args.length > 0 ? args.join(" ") : "Cầu Các Con Giời Hiện Hồn", mention = [];
		for (var userID of listUserIDs) {
			mention.push({ id: userID, tag: body });
		}
		var msg = {
			body: body,
			mentions: mention
		}
		return api.sendMessage(msg, threadID, messageID);
	} catch (e) {
		return api.sendMessage(`Em bị lỗi: ${e.message} anh ơi :(\n\nEm không tag all được :<`, threadID, messageID)
	}
}