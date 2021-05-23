export const ISOtoDateTime = (date: string | undefined): string => {
    if (date) {
        const dt = new Date(date);
        return `${dt.getUTCDate().toString().padStart(2, '0')}.${(dt.getUTCMonth() + 1)
            .toString()
            .padStart(2, '0')}.${dt.getUTCFullYear().toString().padStart(4, '0')} ${dt
            .getUTCHours()
            .toString()
            .padStart(2, '0')}:${dt.getUTCMinutes().toString().padStart(2, '0')}`;
    }

    return '';
};

export const ISOtoDateTimePicker = (date: string | undefined): string => {
    return date ? date.slice(0, -8) : '';
};
