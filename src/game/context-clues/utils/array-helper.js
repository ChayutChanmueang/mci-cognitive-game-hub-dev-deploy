export function removeFirstMatchingValueInPlace(array, value) {
    if (!Array.isArray(array)) {
        throw new TypeError("removeFirstMatchingValueInPlace expects an array.");
    }

    const index = array.indexOf(value);

    if (index !== -1) {
        array.splice(index, 1);
    }

    return array;
}

export function createArrayWithoutFirstMatchingValue(array, value) {
    if (!Array.isArray(array)) {
        throw new TypeError("createArrayWithoutFirstMatchingValue expects an array.");
    }

    const index = array.indexOf(value);

    if (index === -1) {
        return [...array];
    }

    return [
        ...array.slice(0, index),
        ...array.slice(index + 1)
    ];
}
