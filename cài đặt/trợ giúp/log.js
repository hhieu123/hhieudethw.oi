const color= {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m"
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m"
    }
};
    
module.exports = (type, data, option) => {
    const moment = require("moment-timezone");
    const hours = moment.tz("asia/quy_nhon").format("HH:mm:ss");
    switch (option) {
		case "warn":
			console.log("\n" + color.fg.yellow + "[ " + type + " | " + color.fg.yellow + hours + " ] » " + data + color.reset + "\n");
			break;
		case "error":
			console.log("\n" + color.fg.red + "[ " + type + " | " + color.fg.yellow + hours + color.fg.red + " ] » " + data + color.reset + "\n");
			break;
        case "cyan":
			console.log("\n" + color.fg.cyan + "[ " + type + " | " + color.fg.yellow + hours + color.fg.cyan + " ] » " + data + color.reset + "\n");
			break;
        case "blue":
			console.log("\n" + color.fg.blue + "[ " + type + " | " +  color.fg.yellow + hours + color.fg.blue + " ] » " + data + color.reset + "\n");
			break;
        case "crimson":
			console.log("\n" + color.fg.crimson + "[ " + type + " | " +  color.fg.yellow + hours + color.fg.crimson + " ] » " + data + color.reset + "\n");
			break;
        case "magenta":
			console.log("\n" + color.fg.magenta + "[ " + type + " | " +  color.fg.yellow + hours + color.fg.magenta + " ] » " + data + color.reset + "\n");
			break;
		default:
			console.log("\n" + color.fg.green + "[ " + type + " | " +  color.fg.yellow + hours + color.fg.green + " ] » " + data + color.reset + "\n");
			break;
	}
};

module.exports.event = (data) => {
    console.log(data);
    console.log("\n");
}

module.exports.update = (version, data) => {
    console.log("\n" + color.fg.yellow + "[ UPDATE - " + version + " ] » " + data + color.reset + "\n");
}