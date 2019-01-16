/**
 * @author An Duong
 * @description Handle json related
 */

/**
 * Find index of given start and close pattern
 * @param {string} str string to be search
 * @param {number} indexStart index to start within the string
 * @param {string} startPat starting patern
 * @param {string} endPat ending patern
 * @return {number[]} index of the open and close
 */
export const findEnclosure = (str, indexStart, startPat, endPat) => {
    const openIndex = str.substr(indexStart).indexOf(startPat) + indexStart;
    let openCount = 1;
    let closeCount = 0;
    let currIndex = openIndex + 1;

    if (!openIndex) {
        return null;
    }

    while (str[currIndex]) {

        if (str[currIndex] === startPat) {
            openCount += 1;
            currIndex += 1;
            continue;

        } else if (str[currIndex] === endPat) {
            closeCount += 1;

            if (openCount === closeCount) {
                return [openIndex, currIndex];
            }
        }

        currIndex += 1;
    }

    return null;
};

/**
 * Extract json content from string
 * @param {string} str
 * @param {string} start pattern
 * @param {string} end pattern
 * @return {string[]}
 */
export const extractJson = (str, start = '[', end = ']') => {
    // Sometimes a json object will be in an array pattern and a typical object
    // we will check this edge case pattern first
    let out = [];
    let currIndex = 0;
    let openBrace = 0;
    let objLength = 0;

    while (str[currIndex]) {
        const braces = findEnclosure(str, currIndex, start, end);

        if (braces) {
            openBrace = braces[0];
            objLength = braces[1] - openBrace + 1;
            const objStr = str.substr(openBrace, objLength);

            try {
                const obj = JSON.parse(objStr);

                if (obj) {
                    out.push(str.slice(currIndex > 0 ? currIndex + 1 : 0, openBrace));
                    out.push(obj);
                }

                currIndex = braces[1];
            } catch (err) {
                currIndex += 1;
            }
        } else {
            currIndex += 1;
        }
    }

    if (out.length === 0 && start + end !== '{}') {
        // array pattern was not found, then try the object pattern now if not already
        out = extractJson(str, '{', '}');
    }

    const remainder = str.slice(openBrace + objLength, str.length);
    if ((remainder && remainder !== str) || (out.length === 0)) {
        out.push(remainder);
    }

    return out;
};
