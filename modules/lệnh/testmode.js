module.exports.info = {
	name: "testmode",
	version: "1.0.0",
	permissions: 3,
	author: {
		name: "hhieu",
		facebook: "https://www.facebook.com/TrungHieu2k9/"
	},
	description: {
        long: "Chế độ chỉ người quản lí Bot mới có thể sử dụng Bot",
        short: "Bật/tắt testMode"
    },
	group: "system",
	guide: [
		'',
	],
	countdown: 5
};

module.exports.run = function({ api, event, tecna }) {
    var { threadID, messageID } = event;
    var { testMode } = tecna.configs;
    if (testMode == false) {
        tecna.configs.testMode = true;
        return api.sendMessage(`Đã bật chế độ testMode, chỉ người quản lí Bot mới có thể sử dụng Bot.`, threadID, messageID);
    } else {
        tecna.configs.testMode = false;
        return api.sendMessage(`Đã tắt chế độ testMode`, threadID, messageID);
    }
}