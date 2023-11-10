function put(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
}
function get(key, defaultValue) {
    return JSON.parse(localStorage?.getItem(key)) ?? defaultValue;
}
function clear() {
    return localStorage.clear();
}


const getScoresHistory = function () {
    return get('SCORES_HISTORY');
}
const saveScoresHistory = function (value) {
    return put('SCORES_HISTORY', value);
}
const getEmojiSet = function () {
    return get('EMOJI_SET');
}
const saveEmojiSet = function (value) {
    return put('EMOJI_SET', value);
}

const DB = {
    getScoresHistory, saveScoresHistory, getEmojiSet, saveEmojiSet, clear
};
export default DB;