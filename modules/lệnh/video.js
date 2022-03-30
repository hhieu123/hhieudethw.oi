module.exports.info = {
	name: "video",
	version: "1.0.1",
	permissions: 1,
	author: {
		name: "hhieu",
		facebook: "hhieu"
	},
	description: {
        long: "Tim video có trên youtube (Miễn là có trên youtube là sẽ tìm được)",
        short: "Tim video trên youtube"
    },
	group: "Tools",
	guide: [
		'[tên video muốn tìm]',
	],
	countdown: 5,
	require: {
		"ytdl-core": "",
		"fs-extra": "",
		"simple-youtube-api": ""
	}
};

module.exports.handleMessageReply = async function({ api, event, Reply }) {
	if (isNaN(event.body)) return api.unsendMessage(Reply.messageID);
	if (Reply.author != event.senderID) return api.sendMessage('Ê mạy. Chọn bài nào thì tự kiếm chứ tranh của người khác thế à?', event.threadID, event.messageID);
	const ytdl = require("ytdl-core");
	const { createReadStream, createWriteStream, unlinkSync, statSync } = require("fs-extra");
	api.sendMessage("Ngồi đó chờ tao 1 tí để tao đi lấy video về cho mày :/", event.threadID, (error, info) => { tecna.autoUnsend(info.messageID, 15000, api) }, event.messageID);
	try {
		ytdl(Reply.link[event.body - 1])
			.pipe(createWriteStream(__dirname + `/cache/${Reply.link[event.body - 1]}.mp4`))
			.on("close", () => {
				if (statSync(__dirname + `/cache/${Reply.link[event.body - 1]}.mp4`).size > 26214400) return api.sendMessage('Video này hơn 25MB, nặng quá tao không vác được, chọn bài khác đi mạy.', event.threadID, () => unlinkSync(__dirname + `/cache/${Reply.link[event.body - 1]}.mp4`), event.messageID);
				else return api.sendMessage({ body: `Video ${Reply.task[event.body - 1].name}:`, attachment: createReadStream(__dirname + `/cache/${Reply.link[event.body - 1]}.mp4`)}, event.threadID, () => unlinkSync(__dirname + `/cache/${Reply.link[event.body - 1]}.mp4`), event.messageID)
			})
			.on("error", (error) => api.sendMessage(`Lỗi khi xử lý yêu cầu: \n${error}`, event.threadID, event.messageID));
	}
	catch {
		api.sendMessage("Ê mày, tao không lấy được video đó. Mày chọn video khác được không?", event.threadID, event.messageID);
	}
	return api.unsendMessage(Reply.messageID);
}

module.exports.run = async function({ api, event, args, multiple }) {
	const ytdl = require("ytdl-core");
	const YouTubeAPI = require("simple-youtube-api");
	const { createReadStream, createWriteStream, unlinkSync, statSync } = require("fs-extra");
	
	const youtube = new YouTubeAPI('AIzaSyBNqRSYmQ9D1WWIa186k8nSvo5mr2Rvk5M');
	
	if (args.length == 0 || !args) return api.sendMessage('Mày không nhập từ khóa tìm kiếm thì bố tao biết đường nào mà lấy video về cho mày?', event.threadID, event.messageID);
	const keywordSearch = args.join(" ");
	const videoPattern = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
	const urlValid = videoPattern.test(args[0]);
	
	if (urlValid) {
		try {
            var id = args[0].split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
			(id[2] !== undefined) ? id = id[2].split(/[^0-9a-z_\-]/i)[0] : id = id[0];
			ytdl(args[0])
				.pipe(createWriteStream(__dirname + `/cache/${id}.mp4`))
				.on("close", () => {
					if (statSync(__dirname + `/cache/${id}.mp4`).size > 26214400) return api.sendMessage('Video này hơn 25MB, nặng quá tao không vác được, chọn video khác đi mạy.', event.threadID, () => unlinkSync(__dirname + `/cache/${id}.mp4`), event.messageID);
					else return api.sendMessage({attachment: createReadStream(__dirname + `/cache/${id}.mp4`)}, event.threadID, () => unlinkSync(__dirname + `/cache/${id}.mp4`) , event.messageID)
				})
				.on("error", (error) => api.sendMessage(`Lỗi khi xử lý yêu cầu: \n${error}`, event.threadID, event.messageID));
		}
		catch {
			api.sendMessage("Ê mày, tao không lấy được video đó. Mày chọn bài khác được không?", event.threadID, event.messageID);
		}

	}
	else {
		try {
			var link = [], msg = "", num = 0, task = [];
			var results = await youtube.searchVideos(keywordSearch, 5);
			for (let value of results) {
				if (typeof value.id == 'undefined') return;
				link.push(value.id);
                task.push({id: value.id, name: value.title});
				msg += (`${num+=1}. ${value.title}\n`);
			}
			return api.sendMessage(`🎼 Có ${link.length} kết quả trùng với từ khoá tìm kiếm của bạn: \n${msg}\nHãy reply(phản hồi) chọn một trong những tìm kiếm trên`, event.threadID,(error, info) => multiple.handleMessageReply.push({ name: this.info.name, messageID: info.messageID, author: event.senderID, link, task }), event.messageID);
		}
		catch (error) {
			api.sendMessage("Không thể xử lý request do dã phát sinh lỗi: " + error.message, event.threadID, event.messageID);
		}
	}
}