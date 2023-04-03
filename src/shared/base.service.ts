import {LoginResponseModel} from "./models/LoginResponseModel";
import {Subject} from "rxjs";
import {Msg} from "./models/message-type";

export class BaseService {
   static key = 'static-2894trgkhh-telemedit-9762mobi';

   static Menu = new Subject<any[]>();

   static currentMessage = new Subject<Msg>();

    static setSessionData = (data: any) => {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    static clearSessionData(): void {
        localStorage.removeItem(this.key);
    }

    static getSessionData = (): any => {
        if (localStorage.getItem(this.key)) {
            return JSON.parse(localStorage.getItem(this.key) as string);
        }
        return false;
    }

    static getTimeLeft = (firstdate: any, seconddate: any) => {
        return Math.abs(new Date(firstdate).getTime() - new Date(seconddate).getTime())/1000;
    }

    static random_rgba = () => {
        const o = Math.round, r = Math.random, s = 255;
        const color = 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + ' 1.0)';
        if (color === 'rgba(0, 0, 0, 1.0)') {
            this.random_rgba();
        } else {
            return color;
        }
    }

    static uuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r && 0x3 || 0x8);
            return v.toString(16);
        });
    }

    static HttpHeaders = () => {
        let accessObj: LoginResponseModel = JSON.parse(localStorage.getItem(BaseService.key) as string) as LoginResponseModel;
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessObj?.accessToken?.token}`
        }
    }

    static countFormatter = (count: any) => {
        if (count > 999 && count < 1000000){
            return (Math.abs(count / 1000)).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million
        }else if (count > 1000000){
            return (Math.abs(count / 1000000)).toFixed(1) + 'M'; // convert to M for number from > 1 million
        }else if (count < 900){
            return count; // if value < 1000, nothing to do
        }
    }
}
export const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
