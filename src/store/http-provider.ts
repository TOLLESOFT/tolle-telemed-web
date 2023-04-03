
import {from, Observable} from "rxjs";
import {BaseService} from "../shared/base.service";
export class HttpProvider {
    static apiUrl: any;
    static post = <T>(
        url: string,
        body: any,
        headers: any
    ): Observable<T> => from(fetch(`${HttpProvider.apiUrl}${url}`, {
        method: 'POST',
        body: body,
        headers
    }).then((results) => {
        if (results.status === 401) {
            BaseService.clearSessionData();
            window.location.href = '/';
        }
        return results.json() as T
    }))

    static put = <T>(
        url: string,
        body: any,
        headers: any
    ): Observable<T> => from(fetch(`${HttpProvider.apiUrl}${url}`, {
        method: 'PUT',
        body: body,
        headers
    }).then((results) => {
        if (results.status === 401) {
            BaseService.clearSessionData();
            window.location.href = '/';
        }
        return results.json() as T
    }))

    static get = <T>(
        url: string,
        headers?: any
    ): Observable<T> => from(fetch(`${HttpProvider.apiUrl}${url}`, {
        headers
    }).then((results) => {
        if (results.status === 401) {
            BaseService.clearSessionData();
            window.location.href = '/';
        }
        return results.json() as T
    }));

}
