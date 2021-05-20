export const loadFromLocalStorage = <T>(key: string): T | undefined => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return undefined;
        return JSON.parse(item);
    } catch (e) {
        console.error(e);
        return undefined;
    }
};

export const saveToLocalStorage = <T>(value: T, key: string): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(e);
    }
};
