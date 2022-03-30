module.exports = function({ api, Tecna, multiple, Threads, Users, Others }) {

    async function commandError(command, threadID, messageID) {
        var { prefix: threadPrefix} = multiple.allThreadsInfo.get(threadID);
        var generalPrefix = Tecna.configs.prefix;
        return api.sendMessage(`Có thể bạn đã dùng sai format lệnh, vui lòng sử dụng '${threadPrefix ? threadPrefix : generalPrefix}help ${command}' để biết thêm chi tiết cách sử dụng!`, threadID, messageID);
    }

    async function downloadFile(url, path) {
        const { createWriteStream } = require('fs-extra');
        const axios = require('axios');
    
        const response = await axios({
            method: 'GET',
            responseType: 'stream',
            url
        });
    
        const writer = createWriteStream(path);
    
        response.data.pipe(writer);
    
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }

    async function getContent(link) {
        try {
            const axios = require("axios");
    
            const response = await axios({
                method: 'GET',
                link
            });
    
            const data = response;
    
            return data;
        } catch (e) { return console.log(e); };
    }

    function randomString(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+=-';
        var charactersLength = characters.length || 5;
        for ( var i = 0; i < length; i++ ) result += characters.charAt(Math.floor(Math.random() * charactersLength));
        return result;
    }

    function autoUnsend(ID, Time) {
        return setTimeout(() => api.unsendMessage(ID), Time);
    }

    return {
        commandError,
        downloadFile,
        getContent,
        randomString,
        autoUnsend
    }
}