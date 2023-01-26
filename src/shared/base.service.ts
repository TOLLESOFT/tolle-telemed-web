
export class BaseService {
   static key = 'static-2894trgkhh-telemedit-9762mobi';

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
}
export const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}