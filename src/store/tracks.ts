import axios from 'axios';

import { URLS } from '../common/constants';

export interface ITrack {
    id: number;
    name: string;
    authorId?: number;
    author: string;
}

// *** ACTIONS ***
// Get Tracks
export type getTracksActionType = () => Promise<[true, ITrack[]] | [false, string]>;

export const getTracksAction: getTracksActionType = async () => {
    try {
        const result = await axios.get(URLS.tracks);

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const tracks = result.data.result;

        return [true, tracks];
    } catch (e) {
        return [false, 'Не удалось получить треки'];
    }
};

export type addTrackActionType = (track: ITrack) => Promise<[true, number] | [false, string]>;

export const addTrackAction: addTrackActionType = async (track) => {
    try {
        const result = await axios.post(URLS.track, {
            params: track,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const trackId = result.data.result;

        return [true, trackId];
    } catch (e) {
        return [false, 'Не удалось добавить трек'];
    }
};

export const updateTrackAction: addTrackActionType = async (track) => {
    try {
        const result = await axios.put(URLS.track, {
            params: track,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const trackId = result.data.result;

        return [true, trackId];
    } catch (e) {
        return [false, 'Не удалось изменить трек'];
    }
};
