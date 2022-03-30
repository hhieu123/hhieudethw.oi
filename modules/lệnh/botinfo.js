module.exports.info = {
	name: "botinfo",
	version: "1.0.2",
	permissions: 1,
	author: {
		name: "hhieu",
		facebook: "https://www.facebook.com/TrungHieu2k9/"
	},
	description: {
        long: "Xem tất cả các chi tiết mà Bot có. VD: sever, tất cả người dùng, nhóm...",
        short: "Xem chi tiết về Bot"
    },
	group: "Dành Cho Thành Viên",
	guide: [
		'',
	],
	countdown: 5,
	require: {
		"os": ""
	}
};

function handleByte(byte) {
	const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	let i = 0, usage = parseInt(byte, 10) || 0;

	while(usage >= 1024 && ++i){
		usage = usage/1024;
	}
  
	return(usage.toFixed(usage < 10 && i > 0 ? 1 : 0) + ' ' + units[i]);
}

function handleOS(ping) {
	var os = require("os");
	var cpus = os.cpus();
	var speed, chips;
	for (var i of cpus) chips = i.model, speed = i.speed;
	if (cpus == undefined) return;
	else return msg = `======= Thông Tin Máy Chủ =======\n\n` +
	`Tên Máy Chủ: ${os.hostname}.\nChip: ${chips}.\nTốc Độ Xử Lý: ${speed}MHz.\n\nTổng Bộ Nhớ: ${handleByte(os.totalmem())}.\nĐã Sử Dụng: ${handleByte(os.freemem())} (${(os.freemem() * 100 / os.totalmem()).toFixed()}%).\n\n` +
	`Ping: ${Date.now() - ping}ms.`;
}

module.exports.run = async function({ api, event, multiple, tecna, Threads }) {
	var ping = Date.now();
	var threadInfo = await Threads.getData(event.threadID);
	var prefix = threadInfo.prefix ? threadInfo.prefix : tecna.configs.prefix;
    var { timeStart } = multiple;
    var time = process.uptime(),
        hours = Math.floor(time / (60 * 60)),
        minutes = Math.floor((time % (60 * 60)) / 60),
        seconds = Math.floor(time % 60);
	var severInfo = handleOS(ping);
	var msg = `======= tecna Infomations =======\n\nBắt Đầu Hoạt Động: ${timeStart.fullTime}.\nĐã Hoạt Động:${hours < 10 ? (hours > 0 ? " 0" + hours + " giờ" : "") : (hours > 0 ? " " + hours + " giờ" : "")} ${minutes < 10 ? (minutes > 0 ? " 0" + minutes + " phút" : "") : (minutes > 0 ? " " + minutes + " phút" : "")}${seconds < 10 ? (seconds > 0 ? " 0" + seconds + " giây." : "") : (seconds > 0 ? " " + seconds + " giây." : "")}\n\n` +
	`Tổng Nhóm: ${multiple.allThreadsInfo.size} nhóm.\nTổng Người Dùng: ${multiple.allUsersInfo.size} người.\n` + 
	`Tổng Số Lệnh: ${multiple.commands.size - multiple.commandsHide.length}\n\n` + 
	`Prefix tổng: ${tecna.configs.prefix}\nPrefix của Box: ${prefix}\n\n${severInfo ? severInfo : `Ping: ${Date.now() - ping}ms.`}`
    return api.sendMessage(msg, event.threadID, (error, info) => { tecna.autoUnsend(info.messageID, 1200000) },event.messageID);
}
