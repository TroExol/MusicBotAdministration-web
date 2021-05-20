import axios from 'axios';
import { IAdministrator } from '../store/administrator';

export const getAdministrator = async ({
    login,
    password,
}: {
    login: string;
    password: string;
}): Promise<[true, IAdministrator] | [false, string]> => {
    try {
        const res = await axios.get('http://localhost:5000/admin', {
            params: {
                login,
                password,
            },
        });

        const administrator = res.data.recordset;

        return administrator.length > 0
            ? [
                  true,
                  {
                      id: administrator[0].ID,
                      login: administrator[0].Логин,
                      fio: administrator[0].ФИО,
                  },
              ]
            : [false, 'Неправильно указаны данные авторизации'];
    } catch (e) {
        return [false, 'Не удалось получить информацию с сервера'];
    }
};

export const ad = {};
