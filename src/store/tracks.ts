import axios from 'axios';

import { URLS } from '../common/constants';

export interface ITrack {
    id: number;
    track: string;
    authorId: number;
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
        return [false, 'Не удалось получить информацию с сервера'];
    }
};
